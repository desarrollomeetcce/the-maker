'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function generateTitleAction() {
    const prompt = `Genera un título creativo y llamativo para un libro que trate sobre desarrollo personal, tecnología o creatividad.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    })

    const title = response.choices[0]?.message?.content?.trim() || 'Título generado'
    return title
}

export async function generateSubtopicsAction(title: string) {
    const prompt = `Dado el título del libro: "${title}", sugiere entre 5 a 10 subtemas importantes que se podrían abordar en el libro. Solo devuelve una lista sencilla.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content || ''
    const subtopics = content
        .split(/\n|•|-|\*/)
        .map((s) => s.trim())
        .filter((s) => s.length > 3)

    return subtopics
}


export async function generateContentAction(subtopic: string, title: string) {
    const prompt = `
Escribe un capítulo completo para un libro titulado "${title}" sobre el subtema "${subtopic}". 

Debes estructurarlo como un capítulo largo de al menos 800 palabras, con una introducción, desarrollo y una breve conclusión. sin poner literalmente introducción, desarrollo ni conclusión

Usa párrafos bien distribuidos, estilo narrativo formal y separaciones naturales para facilitar la lectura.

No incluyas encabezados, solo el cuerpo del texto. No repitas el título ni el subtema.
`;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
}


export async function generateCoverImageAction(title: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Una ilustración  que represente el concepto de "${title}",  sin bordes, estilo editorial moderno. Centrado en el tema, como portada de libro pero solo la imagen visual.`,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  });

  if (!response || !response.data || response.data.length === 0 || !response.data[0].url) {
    throw new Error("No se pudo generar la imagen.");
  }

  return response.data[0].url;
}
