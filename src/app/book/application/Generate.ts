'use server'

import OpenAI from 'openai'


import { mkdir } from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';
import fs from 'fs';

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
  const prompt = `Dado el título del libro: "${title}", sugiere entre 10 o más subtemas importantes que se podrían abordar en el libro. Solo devuelve una lista sencilla.`;

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
Eres un generador de contenido para libros que se exportan como HTML. Escribe un capítulo largo (mínimo 800 palabras) para un libro titulado "${title}" con el subtema "${subtopic}".

El texto debe estar en formato HTML válido, dividido en varios párrafos <p>. Cada 6 u 8 párrafos aproximadamente, incluye un marcador para imagen con esta estructura exacta:

<div class="image-placeholder"></div>

El texto debe ser fluido, narrativo y formal. No incluyas encabezados, títulos ni menciones al título o subtema. No uses listas ni negritas, solo texto plano en párrafos HTML.

Ejemplo de estructura esperada:

<p>Texto del primer párrafo...</p>
<p>Texto del segundo párrafo...</p>
<p>Texto del tercero...</p>
<div class="image-placeholder"></div>
<p>Texto que continúa...</p>
...

Solo devuelve el contenido HTML, sin explicaciones ni comentarios adicionales.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}


export async function generateCoverImageAction(title: string): Promise<string> {

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Una imagen del tamaño de una cuartilla que represente el concepto de "${title}",  sin bordes. Centrado en el tema, que sirva como portada de libro pero solo la imagen visual. Sin texto`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    if (!response || !response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error("No se pudo generar la imagen.");
    }

    return response.data[0].url;
  } catch (err) {
    return ""
  }

}

export async function insertImagesIntoHTML(html: string, topic: string, subtopic: string): Promise<string> {
  const placeholderRegex = /<div class="image-placeholder"><\/div>/g;
  const matches = html.match(placeholderRegex);
  if (!matches) return html;

  let counter = 1;
  let updatedHTML = html;

  for (const match of matches) {
    try {
      const imagePrompt = `Ilustración editorial para un libro sobre el subtema "${subtopic}" del tema general "${topic}". Sin texto, estilo profesional.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) continue;

      const imageTag = `<img src="${imageUrl}" alt="Imagen ilustrativa ${counter}" style="width:100%; margin: 2rem 0;" />`;
      updatedHTML = updatedHTML.replace(match, imageTag);
    } catch (err) {
      console.log(`No se pudo generar la imagen`)
      console.log(err)
    }
    counter++;
  }

  return updatedHTML;
}



export async function generateFullBookAction(
  title: string,
  filenameSlug: string,
  bookId: string,
  includeImages: boolean
): Promise<{ success: boolean; bookId: string; indexUrl: string }> {
  const subtopics = await generateSubtopicsAction(title);
  const baseDir = path.resolve(process.cwd(), 'public', 'generated', bookId);

  const filename = `${filenameSlug}.html`;
  const fullPath = path.join(baseDir, filename);
  const publicPath = `/generated/${bookId}/${filename}`;

  await mkdir(baseDir, { recursive: true });

  const date = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const coverImageUrl = await generateCoverImageAction(title);
  const localCoverPath = await downloadImageToLocal(coverImageUrl, bookId, filenameSlug);

  let fullHTML = `
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      @page {
        size: A4;
        margin: 2.5cm;
      }
      body {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 14pt;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: auto;
      }
      h1, h2, h3 {
        text-align: center;
      }
      h1 {
        font-size: 28pt;
        margin-top: 3rem;
        margin-bottom: 2rem;
      }
      .cover-date {
        text-align: center;
        font-size: 14pt;
        margin-top: 1rem;
        color: #555;
      }
      .cover-image {
        width: 100%;
        height: auto;
        margin-top: 2rem;
        margin-bottom: 4rem;
        display: block;
        page-break-after: avoid;
      }
      h2 {
        font-size: 20pt;
        margin-top: 6rem;
        margin-bottom: 2rem;
        page-break-before: always;
      }
      p {
        text-align: justify;
        margin-bottom: 1.2rem;
      }

      ${includeImages
    &&
    `.image-placeholder {
        height: 300px;
        margin: 2rem 0;
        background-color: #eee;
        border: 1px dashed #aaa;
      }`
    }
    
    </style>
  </head>
  <body>
    <img src="${localCoverPath}" class="cover-image" alt="Portada del libro" />
    <h1>${title}</h1>
    <div class="cover-date">${date}</div>
`;


  console.log(`Generando tomo ${title}`);
  console.log(subtopics);

  for (let i = 0; i < subtopics.length; i++) {
    const subtopic = subtopics[i];

    try {
      const rawHtml = await generateContentAction(subtopic, title);
      fullHTML += `
        <h2>${subtopic}</h2>
        ${rawHtml}
      `;
    } catch (e) {
      console.error(`Error generando el subtema: ${subtopic}`, e);
      fullHTML += `<p style="color:red;">Error generando el subtema: ${subtopic}</p>`;
    }
  }

  fullHTML += `
    </body>
    </html>
  `;

  await writeFile(fullPath, fullHTML, 'utf8');

  if (includeImages) {
    const htmlWithImages = await insertContextualImagesAndStore(fullHTML, title, bookId, baseDir);
    await writeFile(fullPath, htmlWithImages, 'utf8');
  }

  return {
    success: true,
    bookId,
    indexUrl: publicPath,
  };
}

import { default as fetch } from 'node-fetch';

export async function downloadImageToLocal(url: string, bookId: string, tomoSlug: string): Promise<string> {
  const imageDir = path.resolve(process.cwd(), 'public', 'generated', bookId, 'images');
  await mkdir(imageDir, { recursive: true });

  const fileName = `portada-${tomoSlug}.jpg`;
  const filePath = path.join(imageDir, fileName);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar la imagen: ${res.statusText}`);

  const buffer = await res.buffer();
  await writeFile(filePath, buffer);

  return `/generated/${bookId}/images/${fileName}`;
}


export async function insertContextualImagesAndStore(
  html: string,
  topic: string,
  bookId: string,
  baseDir: string
): Promise<string> {
  const placeholderRegex = /<div class="image-placeholder"><\/div>/g;
  const matches = [...html.matchAll(placeholderRegex)];
  if (matches.length === 0) return html;

  let updatedHTML = html;
  let offset = 0;

  const imagesDir = path.join(baseDir, 'images');
  await fs.promises.mkdir(imagesDir, { recursive: true });

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const index = match.index!;

    // Extraer el párrafo antes del placeholder como contexto
    const before = updatedHTML.lastIndexOf('</p>', index);
    const start = updatedHTML.lastIndexOf('<p>', before);
    const contextText = updatedHTML.substring(start + 3, before).trim().slice(0, 200);

    const prompt = `Ilustración editorial realista para un libro sobre el tema "${topic}". La imagen debe representar: "${contextText}". Sin texto, estilo profesional.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) continue;

    // Descargar imagen y guardarla en disco
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imageFilename = `img-${bookId}-${topic.toLowerCase().replace(/[^\w\d]+/g, '-')}-${i + 1}.png`;
    const imagePath = path.join(imagesDir, imageFilename);
    const publicPath = `/generated/${bookId}/images/${imageFilename}`;

    await writeFile(imagePath, buffer);

    const imageTag = `<img src="${publicPath}" alt="Imagen ilustrativa ${i + 1}" style="width:100%; margin: 2rem 0;" />`;

    const placeholderPos = match.index! + offset;
    updatedHTML =
      updatedHTML.slice(0, placeholderPos) +
      imageTag +
      updatedHTML.slice(placeholderPos + match[0].length);

    offset += imageTag.length - match[0].length;
  }

  return updatedHTML;
}

