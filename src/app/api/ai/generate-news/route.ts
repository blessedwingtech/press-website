import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessAiAssistant } from '@/lib/ai-access';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Fonction utilitaire pour générer un slug
function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Enlève les accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-') // Remplace les espaces et autres par des tirets
    .replace(/(^-|-$)+/g, '') // Enlève les tirets au début et à la fin
    + '-' + Math.floor(Math.random() * 10000); // Ajoute un ID unique
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. VÉRIFICATION DE SÉCURITÉ STRICTE
    if (!session || !canAccessAiAssistant(session.user?.email)) {
      return NextResponse.json({ error: 'Accès non autorisé à l\'assistant IA.' }, { status: 403 });
    }

    const body = await req.json();
    const { topic, menuId, submenuId, tone = 'factual', authorId } = body;

    if (!topic || !menuId || !authorId) {
      return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
    const GNEWS_API_KEY = process.env.GNEWS_API_KEY?.trim();
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY?.trim();

    if (!GEMINI_API_KEY || !GNEWS_API_KEY) {
      return NextResponse.json({ 
        error: 'Les clés API ne sont pas correctement configurées sur le serveur.' 
      }, { status: 500 });
    }

    // 2. RECHERCHE DES ACTUALITÉS (GNews API)
    // GNews plante si on envoie des apostrophes ou des guillemets dans la requête
    const safeTopic = topic.replace(/['"&|]/g, ' ').trim();
    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(safeTopic)}&lang=fr&country=fr&max=5&apikey=${GNEWS_API_KEY}`;
    const gnewsResponse = await fetch(gnewsUrl, { cache: 'no-store' });
    const gnewsData = await gnewsResponse.json();

    if (!gnewsResponse.ok || !gnewsData.articles) {
      console.error("Erreur GNews complète:", gnewsData);
      throw new Error(`Impossible de récupérer les actualités depuis GNews. Motif: ${gnewsData.errors?.q || gnewsData.errors?.[0] || 'Inconnu'}`);
    }

    // Formater les sources pour l'IA (ou utiliser le fallback si aucun résultat)
    let newsContext = "";
    if (gnewsData.articles && gnewsData.articles.length > 0) {
      newsContext = "Voici une liste des dernières actualités concernant le sujet :\n" + 
        gnewsData.articles.map((article: any, index: number) => `
        Article ${index + 1}:
        Titre: ${article.title}
        Description: ${article.description}
        Contenu: ${article.content}
        Source: ${article.source.name}
        URL: ${article.url}
      `).join('\n\n');
    } else {
      console.log("GNews a retourné 0 résultats. Fallback vers Google News RSS...");
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=fr&gl=FR&ceid=FR:fr`;
        const rssRes = await fetch(rssUrl, { cache: 'no-store' });
        const xmlText = await rssRes.text();
        
        // Extraction légère via Regex pour lire le flux RSS de Google News
        const items = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 5);
        
        if (items.length > 0) {
          newsContext = "Voici une liste d'actualités vérifiées trouvées via Google News :\n";
          items.forEach((item, index) => {
            const titleMatch = item[1].match(/<title>([\s\S]*?)<\/title>/);
            const linkMatch = item[1].match(/<link>([\s\S]*?)<\/link>/);
            const descMatch = item[1].match(/<description>([\s\S]*?)<\/description>/);
            
            const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
            const link = linkMatch ? linkMatch[1] : '';
            // On nettoie le HTML de la description Google News
            const desc = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>?/gm, '') : '';
            
            newsContext += `\nArticle ${index + 1}:\nTitre: ${title}\nDescription détaillée: ${desc}\nSource URL: ${link}\n`;
          });
        } else {
          newsContext = "Aucune actualité ultra-récente n'a été trouvée en ligne. Rédige un article informatif et pertinent d'analyse générale sur ce sujet.";
        }
      } catch (e) {
        console.error("Erreur RSS Fallback:", e);
        newsContext = "Aucune actualité ultra-récente n'a été trouvée en ligne. Rédige un article informatif et pertinent d'analyse générale sur ce sujet.";
      }
    }

    // 3. RÉDACTION PAR L'IA (Gemini avec cascade de secours)
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const candidateModels = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

    // Spécification de l'angle éditorial
    let toneInstruction = "Style dépêche de presse : direct, factuel, concis et chronologique.";
    if (tone === 'analysis') {
      toneInstruction = "Style analyse & décryptage : mise en perspective, éclairage des causes et conséquences, décryptage d'experts.";
    } else if (tone === 'investigation') {
      toneInstruction = "Style enquête & grand dossier : immersion approfondie, analyse critique, comparaison des sources et mise en lumière des enjeux majeurs.";
    }

    const prompt = `
      Tu es un journaliste expert, neutre et professionnel travaillant pour le média PressTonik.
      Angle et ligne éditoriale demandés : ${toneInstruction}

      Voici une liste des dernières actualités concernant le sujet "${topic}" :
      
      ${newsContext}

      Instructions rédactionnelles strictes (Standards de la presse professionnelle) :
      1. Règle de la pyramide inversée :
         - Commence impérativement par un "Chapô" (1 paragraphe d'accroche résumant les faits clés : Qui, Quoi, Quand, Où, Pourquoi) en gras (<p><strong>...</strong></p>).
         - Développe ensuite les détails, le contexte et les analyses avec au moins 2 ou 3 sous-titres pertinents (balises <h2>).
         - Rédige un article complet, fluide et captivant (entre 450 et 750 mots).
      2. Déontologie et style :
         - Respecte scrupuleusement l'angle éditorial : ${toneInstruction}
         - Pas de formules génériques d'IA comme "Dans cet article, nous allons voir...". Entre directement dans le vif du sujet.
      3. Formatage HTML :
         - Formaté proprement avec des balises <p>, <h2>, <strong>, <blockquote>.
         - Pas de balises <html>, <head> ou <body>.
      4. Sources tierces et attribution :
         - À la fin, insère obligatoirement une section d'attribution :
           <h2>Sources et Références</h2>
           <ul>
             (Insère chaque source tierce avec le nom du média et un lien cliquable <a href="..." target="_blank" rel="noopener noreferrer">Nom du Média / Titre</a>)
           </ul>
      5. Titre : Un titre percutant, percutant et professionnel (sans guillemets superflus).
      6. Requête image Unsplash : 1 à 3 mots-clés en anglais pour illustrer le thème (ex: "family artificial intelligence").

      Réponds impérativement avec un objet JSON valide ayant cette structure :
      {
        "titre": "Titre professionnel de l'article",
        "contenu": "Tout le code HTML de l'article suivant les consignes",
        "image_query": "mots clés en anglais"
      }
    `;

    let articleData: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`Tentative de génération avec le modèle : ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const aiResult = await model.generateContent(prompt);
        const responseText = aiResult.response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const rawJson = jsonMatch ? jsonMatch[0] : responseText;
        const parsed = JSON.parse(rawJson);

        if (parsed.titre && parsed.contenu) {
          articleData = parsed;
          console.log(`Génération réussie avec : ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Modèle ${modelName} indisponible ou en erreur :`, err.message);
        lastError = err;
      }
    }

    if (!articleData) {
      throw new Error(`Aucun modèle IA n'a pu répondre. Dernier motif : ${lastError?.message || 'Erreur inconnue'}`);
    }

    // 4. RECHERCHE DE L'IMAGE SUR UNSPLASH
    let coverImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'; // Fallback
    
    if (UNSPLASH_ACCESS_KEY && articleData.image_query) {
      try {
        const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(articleData.image_query)}&orientation=landscape&per_page=1`, {
          headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        const unsplashData = await unsplashRes.json();
        if (unsplashData.results && unsplashData.results.length > 0) {
          coverImage = unsplashData.results[0].urls.regular;
        }
      } catch (e) {
        console.error("Erreur lors de la récupération de l'image Unsplash", e);
      }
    }

    // 5. SAUVEGARDE EN BROUILLON DANS LA BASE DE DONNÉES
    const slug = generateSlug(articleData.titre);
    
    const newArticle = await db.article.create({
      data: {
        titre: articleData.titre,
        slug: slug,
        contenu: articleData.contenu,
        imagePrincipale: coverImage,
        auteurId: authorId,
        menuId: menuId,
        submenuId: submenuId || null,
        published: false,
      }
    });

    return NextResponse.json({ articleId: newArticle.id });

  } catch (error: any) {
    console.error('Erreur IA détaillée:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur lors de la génération de l\'article.' }, { status: 500 });
  }
}
