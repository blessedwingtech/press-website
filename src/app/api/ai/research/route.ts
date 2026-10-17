import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccessAiAssistant } from '@/lib/ai-access';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Contrôle d'accès strict (PRO ou Whitelist)
    if (!session || !canAccessAiAssistant(session.user as any)) {
      return NextResponse.json({ 
        error: 'Accès réservé aux journalistes PRO ou autorisés.' 
      }, { status: 403 });
    }

    const body = await req.json();
    const { query, tone = 'factual' } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ 
        error: 'Veuillez saisir un sujet ou une requête d\'enquête valide (min 3 caractères).' 
      }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
    const GNEWS_API_KEY = process.env.GNEWS_API_KEY?.trim();

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'La clé GEMINI_API_KEY n\'est pas configurée sur le serveur.' 
      }, { status: 500 });
    }

    // 2. Recherche en temps réel auprès d'agences et sources de presse
    interface VerifiedSource {
      media: string;
      title: string;
      url: string;
      description: string;
    }

    const verifiedSources: VerifiedSource[] = [];

    // Nettoyage de la requête
    const cleanQuery = query
      .replace(/[^a-zA-Z0-9àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆœæ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // A. Essai GNews API (si clé présente)
    if (GNEWS_API_KEY && cleanQuery) {
      try {
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(cleanQuery)}&lang=fr&max=6&apikey=${GNEWS_API_KEY}`;
        const gnewsRes = await fetch(gnewsUrl, { 
          cache: 'no-store',
          signal: AbortSignal.timeout(6000)
        });
        const gnewsData = await gnewsRes.json();
        if (gnewsRes.ok && Array.isArray(gnewsData.articles)) {
          gnewsData.articles.forEach((art: any) => {
            if (art.title && art.url) {
              verifiedSources.push({
                media: art.source?.name || 'Dépêche de presse',
                title: art.title,
                url: art.url,
                description: art.description || art.content || '',
              });
            }
          });
        }
      } catch (err) {
        console.warn('[AI Research] Fallback GNews vers RSS Google News:', err);
      }
    }

    // B. Repli automatique vers Google News RSS
    if (verifiedSources.length === 0 && cleanQuery) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=fr&gl=FR&ceid=FR:fr`;
        const rssRes = await fetch(rssUrl, { 
          cache: 'no-store',
          signal: AbortSignal.timeout(7000)
        });
        const xmlText = await rssRes.text();
        const items = Array.from(xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 6);

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
      } catch (err) {
        console.error('[AI Research] Erreur collecte RSS:', err);
      }
    }

    // 3. Synthèse structurée par Gemini pour un "Carnet de Recherche"
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];

    const sourcesContext = verifiedSources.length > 0
      ? verifiedSources.map((s, idx) => `
Source ${idx + 1}:
- Média : ${s.media}
- Titre : ${s.title}
- Faits rapportés : ${s.description}
- Lien : ${s.url}
`).join('\n')
      : "Aucune dépêche récente n'a été trouvée en direct. Fournis un dossier basé sur les faits avérés et les connaissances solides du sujet.";

    const prompt = `
Tu es un assistant de recherche documentaire et de fact-checking pour un journaliste professionnel de PressTonik.

REMARQUE DÉONTOLOGIQUE ABSOLUE :
Tu NE DOIS PAS rédiger l'article ni écrire de prose à la place du journaliste.
Ton travail est de créer un **CARNET DE RECHERCHE ET DE SOURCING** séparé qui aide le journaliste à construire son propre article.

SUJET RECHERCHÉ : "${query}"
ANGLE ÉDITORIAL SOUHAITÉ : "${tone}"

DOSSIER DES SOURCES DE PRESSE IDENTIFIÉES :
${sourcesContext}

CONSIGNES STRICTES :
1. "keyFacts" : Extrais 4 à 6 faits clés, chiffres, déclarations ou données vérifiables. Pas d'extrapolations.
2. "sources" : Reprends fidèlement les médias et liens ci-dessus. Donne pour chaque source un résumé d'une phrase et une citation textuelle ou fait saillant ("keyQuote") à vérifier.
3. "timeline" : Identifie 3 à 5 dates ou étapes chronologiques des événements.
4. "investigativeAngles" : Propose 2 à 3 angles journalistiques ou questions que le journaliste devrait creuser dans son analyse.
5. "summary" : Synthèse factuelle globale en 2 phrases neutres pour le briefing du journaliste.

Réponds STRICTEMENT avec un JSON valide respectant cette structure exacte :
{
  "summary": "Brève synthèse neutre de 2 phrases pour le briefing",
  "keyFacts": [
    { "id": "1", "fact": "Fait marquant...", "detail": "Précisions chiffrées ou contextuelles..." }
  ],
  "sources": [
    {
      "id": "s1",
      "media": "Nom du média",
      "title": "Titre",
      "url": "Lien officiel",
      "summary": "Ce que ce média rapporte",
      "keyQuote": "Extrait clé ou déclaration à citer"
    }
  ],
  "timeline": [
    { "date": "Date ou repère temporel", "event": "Ce qui s'est passé" }
  ],
  "investigativeAngles": [
    { "angle": "Titre de l'angle", "question": "Question d'investigation ou piste à explorer" }
  ]
}
`;

    let researchResult: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });

        const aiRes = await model.generateContent(prompt);
        const text = aiRes.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

        if (parsed.keyFacts || parsed.sources) {
          researchResult = parsed;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!researchResult) {
      throw new Error(`Impossible de générer le carnet de recherche : ${lastError?.message || 'Erreur inconnue'}`);
    }

    // Assurer la présence des sources vérifiées réelles
    if (verifiedSources.length > 0 && (!researchResult.sources || researchResult.sources.length === 0)) {
      researchResult.sources = verifiedSources.map((s, idx) => ({
        id: `s_${idx + 1}`,
        media: s.media,
        title: s.title,
        url: s.url,
        summary: s.description,
        keyQuote: s.title,
      }));
    }

    return NextResponse.json({
      success: true,
      query,
      data: researchResult,
      sourcesCount: verifiedSources.length,
    });
  } catch (error: any) {
    console.error('[AI Research Route] Erreur:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la recherche IA.' 
    }, { status: 500 });
  }
}
