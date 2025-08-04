
export function markdownToHtml(markdownContent: string, title: string): string {
    // Process blockquotes first, across multiple lines
    let processedMd = markdownContent.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    processedMd = processedMd.replace(/<\/blockquote>\n<blockquote>/g, '\n');

    const html = processedMd
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-4 text-slate-900">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3 text-slate-800">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2 text-slate-700">$1</h3>')
        .replace(/^\* (.*$)/gim, '<li class="ml-6">$1</li>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="my-4 rounded-lg shadow-md mx-auto" />')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
        .replace(/(\n|^)---(\n|$)/gim, '$1<hr class="my-6 border-slate-300">$2')
        .split('\n')
        .map(line => {
            if (line.startsWith('<h') || line.startsWith('<li') || line.startsWith('<hr') || line.startsWith('<blockquote') || line.trim() === '') return line;
            return `<p class="mb-2">${line}</p>`;
        })
        .join('')
        .replace(/<\/li><p /g, '</li><p class="mb-0" ')
        .replace(/(<li>.*?)<p /g, '$1<span ')
        .replace(/<\/p><\/li>/g, '</span></li>');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <style>
        blockquote {
            border-left: 4px solid #cbd5e1;
            padding-left: 1rem;
            font-style: italic;
            margin: 1rem 0;
            color: #475569;
        }
    </style>
</head>
<body class="bg-slate-100">
    <div class="max-w-4xl mx-auto my-8 p-10 bg-white rounded-lg shadow-2xl prose prose-slate">
        ${html}
    </div>
</body>
</html>`;
}
