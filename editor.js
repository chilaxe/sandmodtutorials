document.addEventListener('DOMContentLoaded', () => {
    const pageTitleInput = document.getElementById('pageTitleInput');
    const dynamicPageTitleTextPreview = document.getElementById('dynamicPageTitleTextPreview');
    const addHeaderBtn = document.getElementById('addHeaderBtn');
    const addParagraphBtn = document.getElementById('addParagraphBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const imageUploadInput = document.getElementById('imageUploadInput');
    const exportBtn = document.getElementById('exportBtn');
    const editorPreviewArea = document.getElementById('editor-preview-area');

    const imageFileMap = new Map();

    pageTitleInput.addEventListener('input', (e) => {
        dynamicPageTitleTextPreview.textContent = e.target.value || "Page Title Will Appear Here";
    });
    dynamicPageTitleTextPreview.textContent = pageTitleInput.value || "Page Title Will Appear Here";

    new Sortable(editorPreviewArea, {
        animation: 150,
        handle: '.editable-item',
        ghostClass: 'sortable-ghost',
    });

    function generateUniqueId() {
        return `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const svgIconHTML = `<svg width="28" height="28" viewBox="0 0 0.84 0.84" xmlns="http://www.w3.org/2000/svg"><path d="M.56.7H.28A.105.105 0 0 1 .175.595v-.35a.035.035 0 0 0-.07 0v.35A.175.175 0 0 0 .28.77h.28a.035.035 0 0 0 0-.07M.35.455A.035.035 0 0 0 .385.49H.56a.035.035 0 0 0 0-.07H.385A.035.035 0 0 0 .35.455M.735.313.733.304V.301L.726.291l-.21-.21-.01-.007H.503L.491.07H.35a.105.105 0 0 0-.105.105v.35A.105.105 0 0 0 .35.63h.28A.105.105 0 0 0 .735.525zM.525.189.616.28H.56A.035.035 0 0 1 .525.245Zm.14.336A.035.035 0 0 1 .63.56H.35A.035.035 0 0 1 .315.525v-.35A.035.035 0 0 1 .35.14h.105v.105A.1.1 0 0 0 .461.28H.385a.035.035 0 0 0 0 .07h.28Z"/></svg>`;

    function createEditableWrapper(element, elementType, initialText = '') {
        const wrapper = document.createElement('div');
        wrapper.className = 'editable-item';
        wrapper.dataset.type = elementType;
        wrapper.dataset.id = generateUniqueId();

        if (elementType === 'h2-body' || elementType === 'p-body') {
            element.innerHTML = svgIconHTML;
            const textNode = document.createTextNode(initialText);
            element.appendChild(textNode);
            element.contentEditable = "true";
            element.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
            });
        }
        wrapper.appendChild(element);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = "Delete item";
        deleteBtn.onclick = () => {
            if (elementType === 'img-body') {
                const imgElement = wrapper.querySelector('img');
                if (imgElement && imgElement.dataset.uniqueFileName) {
                    imageFileMap.delete(imgElement.dataset.uniqueFileName);
                }
            }
            wrapper.remove();
        };
        wrapper.appendChild(deleteBtn);
        return wrapper;
    }

    addHeaderBtn.addEventListener('click', () => {
        const text = prompt('Enter header text (H2):', 'Section Header');
        if (text === null) return;

        const h2 = document.createElement('h2');
        h2.className = 'h2-body';
        const wrapper = createEditableWrapper(h2, 'h2-body', text);
        editorPreviewArea.appendChild(wrapper);
    });

    addParagraphBtn.addEventListener('click', () => {
        const text = prompt('Enter paragraph text:', 'Your content here...');
        if (text === null) return;

        const p = document.createElement('p');
        p.className = 'p-body';
        const wrapper = createEditableWrapper(p, 'p-body', text);
        editorPreviewArea.appendChild(wrapper);
    });

    addImageBtn.addEventListener('click', () => {
        imageUploadInput.click();
    });

    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'img-body';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;

                const uniqueFileName = `${generateUniqueId()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
                img.dataset.uniqueFileName = uniqueFileName;
                imageFileMap.set(uniqueFileName, file);

                imgContainer.appendChild(img);
                const wrapper = createEditableWrapper(imgContainer, 'img-body');
                editorPreviewArea.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
            imageUploadInput.value = '';
        }
    });

    exportBtn.addEventListener('click', async () => {
        const zip = new JSZip();
        const pageTitle = pageTitleInput.value.trim() || 'Untitled Page';

        let bodyContentHTML = '';
        const imagesFolder = zip.folder("images");

        const items = editorPreviewArea.querySelectorAll('.editable-item');
        items.forEach(itemWrapper => {
            const type = itemWrapper.dataset.type;
            const element = itemWrapper.children[0];

            if (type === 'h2-body') {
                let textContent = '';
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) textContent += node.textContent;
                });
                bodyContentHTML += `        <h2 class="h2-body">${svgIconHTML}${textContent.trim()}</h2>\n`;
            } else if (type === 'p-body') {
                let textContent = '';
                element.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) textContent += node.textContent;
                });
                bodyContentHTML += `        <p class="p-body">${svgIconHTML}${textContent.trim()}</p>\n`;
            } else if (type === 'img-body') {
                const imgElement = element.querySelector('img');
                if (imgElement && imgElement.dataset.uniqueFileName) {
                    const uniqueFileName = imgElement.dataset.uniqueFileName;
                    const imagePath = `images/${uniqueFileName}`;
                    bodyContentHTML += `        <div class="img-body">\n            <img src="${imagePath}" alt="${imgElement.alt || 'image'}">\n        </div>\n`;
                    if (imageFileMap.has(uniqueFileName)) {
                        imagesFolder.file(uniqueFileName, imageFileMap.get(uniqueFileName));
                    }
                }
            }
        });

        const finalHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="tutorialpage.css">
    <title>${pageTitle}</title>
</head>
<body>
    <header>
        <div class="header-btns">
            <ul>
                <li>
                    <a href="/sandmodtutorials/" class="back">
                        <span>
                            <svg width="32" height="32" viewBox="0 0 0.96 0.96" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="M.68.44H.376L.508.308A.04.04 0 1 0 .451.251l-.2.2-.008.013a.04.04 0 0 0 0 .03l.008.013.2.2a.04.04 0 0 0 .057 0 .04.04 0 0 0 0-.057L.376.52H.68a.04.04 0 0 0 0-.08"/></svg>
                        </span>
                    </a>
                </li>
                <li>
                    <div class="icon">
                        <span>
                            <svg width="32" height="32" viewBox="0 0 0.96 0.96" xmlns="http://www.w3.org/2000/svg"><path d="M.847.082.76.075a.5.5 0 0 0-.28.082.5.5 0 0 0-.28-.08L.113.085a.04.04 0 0 0-.033.04v.48a.04.04 0 0 0 .047.04.44.44 0 0 1 .33.076l.005.003h.004a.04.04 0 0 0 .028 0h.004L.503.721A.44.44 0 0 1 .833.64.04.04 0 0 0 .88.6V.12A.04.04 0 0 0 .847.082M.44.614A.5.5 0 0 0 .2.555H.16v-.4H.2a.43.43 0 0 1 .24.072ZM.8.556H.76a.5.5 0 0 0-.24.059V.227A.43.43 0 0 1 .76.155H.8Zm.047.166L.76.714a.5.5 0 0 0-.28.082A.5.5 0 0 0 .2.714L.113.722A.04.04 0 0 0 .08.768.04.04 0 0 0 .127.8a.44.44 0 0 1 .33.076.04.04 0 0 0 .046 0A.44.44 0 0 1 .833.8.04.04 0 0 0 .88.768.04.04 0 0 0 .847.722"/></svg>
                        </span>
                    </div>
                </li>
            </ul>
        </div>
    </header>
    <div class="content">
        <h3 class="title">${svgIconHTML}${pageTitle}</h3>
        <div class="body">
${bodyContentHTML}
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const img = document.querySelectorAll('.img-body img');
            img.forEach(imgc => {
                imgc.addEventListener('click', function() {
                    this.classList.toggle('enlarged');
                });
            });
        });
    </script>
</body>
</html>`;

        zip.file("page.html", finalHtmlContent);

        try {
            const cssResponse = await fetch('tutorialpage.css');
            if (cssResponse.ok) {
                const cssText = await cssResponse.text();
                zip.file("tutorialpage.css", cssText);
            } else {
                console.warn('tutorialpage.css could not be fetched. It will not be included in the ZIP.');
                alert('Warning: tutorialpage.css was not found or couldn\'t be loaded. It will not be included in the ZIP package. Please ensure it is manually placed alongside page.html after extraction.');
            }
        } catch (error) {
            console.error('Error fetching tutorialpage.css:', error);
            alert('Error: Could not load tutorialpage.css for packaging. Please ensure it is manually placed alongside page.html after extraction.');
        }

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                saveAs(content, `${pageTitle.replace(/\s+/g, '_') || 'website'}_export.zip`);
            });
    });
});