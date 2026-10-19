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
    const { topic, tone = 'factual', researchData } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return NextResponse.json({ 
        error: 'Veuillez préciser un sujet pour la rédaction.' 
      }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'La clé GEMINI_API_KEY n\'est pas configurée sur le serveur.' 
      }, { status: 500 });
    }

    // Préparer le contexte documentaire
    let contextStr = '';
    if (researchData) {
      if (researchData.summary) {
        contextStr += `\nBriefing général : ${researchData.summary}\n`;
      }
      if (Array.isArray(researchData.keyFacts) && researchData.keyFacts.length > 0) {
        contextStr += `\nFaits vérifiables :\n` + researchData.keyFacts.map((f: any, i: number) => `- ${f.fact} ${f.detail ? `(${f.detail})` : ''}`).join('\n') + `\n`;
      }
      if (Array.isArray(researchData.sources) && researchData.sources.length > 0) {
        contextStr += `\nSources et déclarations réelles :\n` + researchData.sources.map((s: any) => `- [${s.media}] ${s.title} : « ${s.keyQuote || s.summary || ''} » (${s.url})`).join('\n') + `\n`;
      }
      if (Array.isArray(researchData.timeline) && researchData.timeline.length > 0) {
        contextStr += `\nRepères chronologiques :\n` + researchData.timeline.map((t: any) => `- ${t.date} : ${t.event}`).join('\n') + `\n`;
      }
    }

    const prompt = `
Tu es un assistant de proposition rédactionnelle pour un journaliste professionnel de PressTonik.

CONSIGNE DÉONTOLOGIQUE MAJEURE :
Le journaliste a formellement accepté la charte éthique qui stipule que toute proposition générée par l'IA est un brouillon de travail consultatif. Le journaliste doit relire, vérifier chaque source et adapter le texte avec sa propre plume.

SUJET : "${topic}"
TON ÉDITORIAL SOUHAITÉ : "${tone}" (factuel, analyse ou investigation)

DOSSIER DE RECHERCHE DE BASE :
${contextStr || 'Aucun carnet préalable fourni, base-toi sur les faits avérés et les informations solides sur ce sujet.'}

MISSION :
Rédige une proposition d'ébauche d'article journalistique complète, rythmée, bien documentée et prête à servir de matière première au journaliste.

STRUCTURE ATTENDUE DE L'ÉBAUCHE :
1. **TITRE PROPOSÉ** : Percutant, clair et professionnel
2. **CHAPEAU** : 2 à 3 phrases résumant l'essentiel (qui, quoi, où, quand, pourquoi)
3. **CORPS DE L'ARTICLE** :
   - Divisé en 2 ou 3 sous-parties claires avec intertitres accrocheurs (ex: ## Intertitre)
   - Intègre les faits clés et mentionne explicitement les sources officielles entre guillemets
   - Style fluide, vocabulaire précis, ton mesuré et journalistique
4. **PERSPECTIVES & ENJEUX À VENIR** : Paragraphe de conclusion ouvrant sur les développements futurs

Formate ta réponse en Markdown clair (avec titres #, ##, gras, citations avec >). Sois constructif, informatif et percutant.
`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];

    let draftContent = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
        });

        const aiRes = await model.generateContent(prompt);
        const text = aiRes.response.text();
        if (text && text.trim().length > 50) {
          draftContent = text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!draftContent) {
      throw new Error(`Échec de la rédaction assistée : ${lastError?.message || 'Erreur inconnue'}`);
    }

    const wordCount = draftContent.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      draft: draftContent,
      wordCount,
      topic,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AI Draft Route] Erreur:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la génération de l\'ébauche IA.' 
    }, { status: 500 });
  }
}
