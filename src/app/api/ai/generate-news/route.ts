import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessAiAssistant } from '@/lib/ai-access';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

    // 2. RECHERCHE DES ACTUALITÉS ET EXTRACTION DES SOURCES VÉRIFIÉES
    interface VerifiedSource {
      media: string;
      title: string;
      url: string;
      description: string;
    }

    let verifiedSources: VerifiedSource[] = [];
    let fetchedArticles: any[] = [];

    try {
      // Nettoyer la requête pour GNews
      const cleanGNewsTopic = topic
        .replace(/[^a-zA-Z0-9àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆœæ\s]/g, ' ')
        .replace(/\b(and|or|not)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanGNewsTopic) {
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(cleanGNewsTopic)}&lang=fr&max=5&apikey=${GNEWS_API_KEY}`;
        const gnewsResponse = await fetch(gnewsUrl, { 
          cache: 'no-store',
          signal: AbortSignal.timeout(7000)
        });
        const gnewsData = await gnewsResponse.json();

        if (gnewsResponse.ok && Array.isArray(gnewsData.articles) && gnewsData.articles.length > 0) {
          fetchedArticles = gnewsData.articles;
          fetchedArticles.forEach((art: any) => {
            if (art.title && art.url) {
              verifiedSources.push({
                media: art.source?.name || 'Agence de presse',
                title: art.title,
                url: art.url,
                description: art.description || art.content || '',
              });
            }
          });
        }
      }
    } catch (gnewsErr) {
      console.warn("Exception lors de l'appel GNews, bascule vers Google News RSS:", gnewsErr);
    }

    // Si GNews n'a rien trouvé, repli vers Google News RSS avec extraction détaillée des médias
    if (verifiedSources.length === 0) {
      console.log("Recherche via Google News RSS pour collecter les informations en direct...");
      try {
        const cleanRssTopic = topic.replace(/['"&|]/g, ' ').trim();
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanRssTopic)}&hl=fr&gl=FR&ceid=FR:fr`;
        const rssRes = await fetch(rssUrl, { 
          cache: 'no-store',
          signal: AbortSignal.timeout(7000)
        });
        const xmlText = await rssRes.text();
        
        const items = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 5);
        
        items.forEach((item) => {
          const rawTitle = item[1].match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
          const sourceName = item[1].match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.trim() || '';
          const link = item[1].match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
          const rawDesc = item[1].match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')?.replace(/<[^>]*>?/gm, '') || '';
          
          let cleanTitle = rawTitle;
          if (sourceName && cleanTitle.endsWith(` - ${sourceName}`)) {
            cleanTitle = cleanTitle.substring(0, cleanTitle.length - (sourceName.length + 3)).trim();
          }

          if (cleanTitle && link) {
            verifiedSources.push({
              media: sourceName || 'Presse d\'information',
              title: cleanTitle,
              url: link,
              description: rawDesc,
            });
          }
        });
      } catch (e) {
        console.error("Erreur RSS Fallback:", e);
      }
    }

    // Construction du contexte factuel et des sources réelles
    let newsContext = "";
    if (verifiedSources.length > 0) {
      newsContext = "DOSSIER DES SOURCES DE PRESSE VÉRIFIÉES :\n" +
        verifiedSources.map((s, index) => `
Source ${index + 1}:
- Média émetteur : ${s.media}
- Titre original : ${s.title}
- Faits et informations rapportés : ${s.description}
- Lien officiel : ${s.url}
`).join('\n');
    } else {
      newsContext = "Aucune dépêche spécifique récente trouvée sur le web. Rédige un article d'analyse factuel basé sur les connaissances avérées du sujet.";
    }

    // 3. RÉDACTION PAR L'IA (Gemini avec cascade sur les modèles actifs vérifiés)
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-3.8-flash",
      "gemini-flash-latest"
    ];

    // Spécification de l'angle éditorial
    let toneInstruction = "Style dépêche de presse : direct, factuel, concis et chronologique.";
    if (tone === 'analysis') {
      toneInstruction = "Style analyse & décryptage : mise en perspective, éclairage des causes et conséquences, décryptage d'experts.";
    } else if (tone === 'investigation') {
      toneInstruction = "Style enquête & grand dossier : immersion approfondie, analyse critique, comparaison des sources et mise en lumière des enjeux majeurs.";
    }

    const prompt = `
      Tu es un journaliste professionnel, rigoureux et neutre pour le média d'actualité PressTonik.
      Ligne éditoriale demandée : ${toneInstruction}

      SUJET : "${topic}"

      ${newsContext}

      CONSIGNES STRICTES D'EXACTITUDE ET D'ATTRIBUTION DES SOURCES :
      1. RÈGLE D'OR (Pas d'extrapolations ni d'inventions) :
         - Tu dois rapporter UNIQUEMENT et STRICTEMENT les faits, déclarations, chiffres et événements décrits dans les sources ci-dessus.
         - N'invente AUCUN fait, aucun chiffre, aucun résultat imaginaire.
         - Dans le corps de l'article, attribue fidèlement chaque fait ou citation à son média d'origine (ex: "Selon les informations rapportées par [Nom du média]...", "D'après les déclarations relayées par [Nom du média]..."). Ne confonds pas les médias entre eux.
      
      2. STRUCTURE PROFESSIONNELLE (Pyramide inversée) :
         - Commence impérativement par un Chapô d'accroche (1 paragraphe résumant Qui, Quoi, Quand, Où, Pourquoi) en gras (<p><strong>...</strong></p>).
         - Développe ensuite les éléments et le contexte avec au moins 2 ou 3 sous-titres pertinents (balises <h2>).
         - Rédige un article complet et captivant (entre 450 et 750 mots).
         - Formatage HTML propre (<p>, <h2>, <strong>, <blockquote>). Pas de balises <html>, <head> ou <body>.

      3. SECTION SOURCES ET RÉFÉRENCES (OBLIGATOIRE ET CONFORME) :
         - Tout à la fin de l'article, insère obligatoirement :
           <h2>Sources et Références</h2>
           <ul>
             ${verifiedSources.length > 0 ? verifiedSources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer"><strong>${s.media}</strong> : ${s.title}</a></li>`).join('\n             ') : '<li>Presse et analyses documentées</li>'}
           </ul>
         - RÈGLE FORMELLE : N'invente AUCUN nom de média fictif et AUCUN lien URL imaginaire. Utilise scrupuleusement la liste ci-dessus.

      4. MÉTADONNÉES :
         - Titre : Un titre percutant, professionnel et fidèle aux faits réels (sans guillemets).
         - Requête image Unsplash : 1 à 3 mots-clés simples en anglais pour illustrer le sujet (ex: "stadium football action").

      Réponds impérativement avec un objet JSON valide ayant cette structure :
      {
        "titre": "Titre professionnel de l'article",
        "contenu": "Corps HTML complet de l'article avec la section Sources et Références",
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
      if (lastError?.message?.includes('503') || lastError?.message?.includes('high demand') || lastError?.message?.includes('overloaded')) {
        throw new Error("Les serveurs de Google IA sont momentanément très sollicités (Erreur 503 temporaire). Veuillez patienter 5 à 10 secondes puis relancer la génération.");
      }
      throw new Error(`Aucun modèle IA n'a pu répondre. Dernier motif : ${lastError?.message || 'Erreur inconnue'}`);
    }

    // 4. GARANTIE D'AUTHENTICITÉ DES SOURCES ET RÉFÉRENCES
    if (verifiedSources.length > 0) {
      const verifiedSourcesHtml = `<h2>Sources et Références</h2>\n<ul>\n${verifiedSources.map(s => `  <li><a href="${s.url}" target="_blank" rel="noopener noreferrer"><strong>${s.media}</strong> : ${s.title}</a></li>`).join('\n')}\n</ul>`;
      
      if (articleData.contenu.includes('<h2>Sources')) {
        articleData.contenu = articleData.contenu.replace(/<h2>Sources[\s\S]*$/i, verifiedSourcesHtml);
      } else {
        articleData.contenu = articleData.contenu.trim() + '\n\n' + verifiedSourcesHtml;
      }
    }

    // 5. RECHERCHE DES IMAGES CANDIDATES SUR UNSPLASH
    let coverImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'; // Fallback
    let candidateImages: Array<{ id: string; url: string; thumb: string; photographer: string }> = [];

    if (UNSPLASH_ACCESS_KEY && articleData.image_query) {
      try {
        const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(articleData.image_query)}&orientation=landscape&per_page=6`, {
          headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` },
          signal: AbortSignal.timeout(7000)
        });
        const unsplashData = await unsplashRes.json();
        if (unsplashData.results && unsplashData.results.length > 0) {
          coverImage = unsplashData.results[0].urls.regular;
          candidateImages = unsplashData.results.map((p: any) => ({
            id: p.id,
            url: p.urls.regular,
            thumb: p.urls.small,
            photographer: p.user?.name || 'Unsplash',
          }));
        }
      } catch (e) {
        console.error("Erreur lors de la récupération des images Unsplash", e);
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

    return NextResponse.json({
      articleId: newArticle.id,
      titre: articleData.titre,
      coverImage,
      candidateImages,
      imageQuery: articleData.image_query,
    });

  } catch (error: any) {
    console.error('Erreur IA détaillée:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur lors de la génération de l\'article.' }, { status: 500 });
  }
}
