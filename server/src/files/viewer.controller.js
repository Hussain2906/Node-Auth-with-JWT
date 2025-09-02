const { FileModel } = require('./file.model');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || "http://localhost:8000";

function fileServeUrl(id) { return `/fileserve/${id}`; }

function pageSkeleton({ title, bodyHtml }) {
    return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-50 text-gray-900">
        <section class="py-16">
          <div class="mx-auto max-w-5xl space-y-10 px-6">
            <h2 class="text-3xl font-semibold">${title}</h2>
            <div class="grid gap-8 md:grid-cols-2 items-start">
              <div class="rounded-lg overflow-hidden">
                ${bodyHtml}
              </div>
              <div class="space-y-4">
                <p class="text-gray-600">This is your uploaded file. You can view or download it directly.</p>
                <blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700">
                  Sharing made simple — preview, download, and use your files anytime.
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      </body>
    </html>`;
  }
  
  

  function buildEmbedHtml(doc) {
    const src = fileServeUrl(doc._id.toString());
  
    const raw = String(doc.mimeType || "").toLowerCase().trim();
    const mt = raw;
    const storagePath = doc?.storage?.path || "";
    const ext = (storagePath.split(".").pop() || "").toLowerCase();
  
    const isImage = mt.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "bmp", "avif"].includes(ext);
    const isVideo = mt.startsWith("video/") || ["mp4", "mov", "webm", "ogg"].includes(ext);
    const isPdf   = mt === "application/pdf" || ext === "pdf";
  
    let preview = `<p class="text-gray-600">Preview not available for <code>${mt || ext || "unknown"}</code>.</p>`;
    
    if (isImage) {
      preview = `<img src="${src}" alt="${doc.originalName}" class="rounded-lg shadow w-full"/>`;
    }
    if (isVideo) {
      preview = `<video controls src="${src}" class="rounded-lg shadow w-full"></video>`;
    }
    if (isPdf) {
      preview = `<iframe src="${src}" class="rounded-lg shadow w-full h-[70vh] border"></iframe>`;
    }
  
    return `
      <div class="space-y-4">
        ${preview}
        <a href="${src}" download
           class="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
           Download
        </a>
      </div>
    `;
  }
  
  

const handleViewer = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await FileModel.findById(id);
        if (!doc) {
            return res.status(404).send("Not found");
        } const bodyHtml = buildEmbedHtml(doc);
        const html = pageSkeleton({ title: doc.originalName, bodyHtml });
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(html);
    } catch (err) {
        return res.status(500).send("Viewer error");
    }
}
module.exports = { handleViewer };