document.addEventListener('DOMContentLoaded', () => {
    const assetsGridContainer = document.getElementById('assets-grid-container');
    const modal = document.getElementById('asset-modal');
    const modalAssetName = document.getElementById('modal-asset-name');
    const modalAssetDescription = document.getElementById('modal-asset-description');
    const modalDownloadButton = document.getElementById('modal-download-button');
    const modalPreviewArea = modal.querySelector('.modal-preview-area');
    const closeModalButton = modal.querySelector('.modal-close-button');

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('search-action-button');
    const filterBtnAll = document.getElementById('filter-btn-all');
    const filterBtn3D = document.getElementById('filter-btn-3d');
    const filterBtnGameAssets = document.getElementById('filter-btn-game-assets');


    const placeholderGameIconSVG = `
<svg fill="#b4b4b4" width="180px" height="180px" viewBox="0 0 5.4 5.4" xmlns="http://www.w3.org/2000/svg"><path d="M4.275 1.238h-1.413l-0.072 -0.225a0.675 0.675 0 0 0 -0.639 -0.45H1.125a0.675 0.675 0 0 0 -0.675 0.675v2.925a0.675 0.675 0 0 0 0.675 0.675h3.15a0.675 0.675 0 0 0 0.675 -0.675v-2.25a0.675 0.675 0 0 0 -0.675 -0.675m0.225 2.925a0.225 0.225 0 0 1 -0.225 0.225H1.125a0.225 0.225 0 0 1 -0.225 -0.225v-2.925a0.225 0.225 0 0 1 0.225 -0.225h1.026a0.225 0.225 0 0 1 0.214 0.153l0.122 0.369a0.225 0.225 0 0 0 0.214 0.153h1.575a0.225 0.225 0 0 1 0.225 0.225Z"/></svg>
    `;

    const allAssets = [
        {
            id: '3d-model-1',
            name: 'SimpleTestModel',
            type: '3d',
            previewSrc: '#',
            description: 'SimpleTestModel',
            downloadUrl: '#',
        },
        {
            id: 'game-asset-1',
            name: 'SimpleGameAsset',
            type: 'game',
            previewIconSVG: `
            <svg fill="#b4b4b4" width="180px" height="180px" viewBox="0 0 5.4 5.4" xmlns="http://www.w3.org/2000/svg"><path d="M4.275 1.238h-1.413l-0.072 -0.225a0.675 0.675 0 0 0 -0.639 -0.45H1.125a0.675 0.675 0 0 0 -0.675 0.675v2.925a0.675 0.675 0 0 0 0.675 0.675h3.15a0.675 0.675 0 0 0 0.675 -0.675v-2.25a0.675 0.675 0 0 0 -0.675 -0.675m0.225 2.925a0.225 0.225 0 0 1 -0.225 0.225H1.125a0.225 0.225 0 0 1 -0.225 -0.225v-2.925a0.225 0.225 0 0 1 0.225 -0.225h1.026a0.225 0.225 0 0 1 0.214 0.153l0.122 0.369a0.225 0.225 0 0 0 0.214 0.153h1.575a0.225 0.225 0 0 1 0.225 0.225Z"/></svg>`,
            modalImageSrc: 'logo_sandmod.svg',
            description: 'SimpleGameAsset',
            downloadUrl: '#',
        },
    ];

    let currentFilter = 'all';
    let currentSearchTerm = '';

    function renderAssets(assetsToDisplay) {
        assetsGridContainer.innerHTML = '';

        if (!assetsToDisplay || assetsToDisplay.length === 0) {
            return;
        }

        assetsToDisplay.forEach(asset => {
            const card = document.createElement('div');
            card.className = 'asset-card';
            card.dataset.assetId = asset.id;

            const previewArea = document.createElement('div');
            previewArea.className = 'card-preview-area';

            if (asset.type === '3d') {
                const modelViewer = document.createElement('model-viewer');
                modelViewer.setAttribute('src', asset.previewSrc);
                modelViewer.setAttribute('alt', asset.name);
                modelViewer.setAttribute('auto-rotate', '');
                modelViewer.setAttribute('camera-controls', '');
                previewArea.appendChild(modelViewer);
            } else if (asset.type === 'game') {
                const iconDiv = document.createElement('div');
                iconDiv.className = 'game-asset-icon-svg';
                iconDiv.innerHTML = asset.previewIconSVG || placeholderGameIconSVG;
                previewArea.appendChild(iconDiv);
            }

            const nameElement = document.createElement('p');
            nameElement.className = 'asset-card-name';
            nameElement.textContent = asset.name;

            card.appendChild(previewArea);
            card.appendChild(nameElement);

            card.addEventListener('click', () => openModal(asset));
            assetsGridContainer.appendChild(card);
        });
    }

    function openModal(asset) {
        modalAssetName.textContent = asset.name;
        modalAssetDescription.textContent = asset.description;
        modalDownloadButton.href = asset.downloadUrl;


        modalPreviewArea.innerHTML = '';

        if (asset.type === '3d') {
            const modelViewer = document.createElement('model-viewer');
            modelViewer.setAttribute('src', asset.previewSrc);
            modelViewer.setAttribute('alt', asset.name);
            modelViewer.setAttribute('camera-controls', '');
            modelViewer.setAttribute('autoplay', '');
            modelViewer.style.width = '100%';
            modelViewer.style.height = '100%';

            modalPreviewArea.appendChild(modelViewer);
        } else if (asset.type === 'game') {
            const image = document.createElement('img');
            image.src = asset.modalImageSrc || 'https://via.placeholder.com/400x300.png?text=Preview+Not+Available';
            image.alt = asset.name;
            image.className = 'modal-asset-image';
            modalPreviewArea.appendChild(image);
        }

        modal.style.display = 'flex';
    }

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
        modalPreviewArea.innerHTML = '';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modalPreviewArea.innerHTML = '';
        }
    });

    function filterAndSearchAssets() {
        let filteredAssets = allAssets;

        if (currentFilter !== 'all') {
            filteredAssets = filteredAssets.filter(asset => asset.type === currentFilter);
        }

        if (currentSearchTerm) {
            const searchTermLower = currentSearchTerm.toLowerCase();
            filteredAssets = filteredAssets.filter(asset =>
                asset.name.toLowerCase().includes(searchTermLower) ||
                (asset.description && asset.description.toLowerCase().includes(searchTermLower))
            );
        }
        renderAssets(filteredAssets);
    }
      const filterArea = document.querySelector(".filter-area");
      const filterIcon = document.querySelector(".filter .icon");

      filterIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      filterArea.classList.toggle("active");
      });

        document.addEventListener("click", (e) => {
       if (!filterArea.contains(e.target) && !filterIcon.contains(e.target)) {
         filterArea.classList.remove("active");
       }
   });

    const filterButtons = [filterBtn3D, filterBtnGameAssets];
    filterButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                const isActive = button.classList.contains('active');
                filterButtons.forEach(btn => btn && btn.classList.remove('active'));
                if (!isActive) {
                    button.classList.add('active');
                    if (button.id === 'filter-btn-3d') currentFilter = '3d';
                    else if (button.id === 'filter-btn-game-assets') currentFilter = 'game';
                } else {
                    currentFilter = 'all';
                    if (filterBtnAll) filterBtnAll.classList.add('active');
                }
                filterAndSearchAssets();
            });
        }
    });


    if(searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            currentSearchTerm = searchInput.value;
            filterAndSearchAssets();
        });
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                currentSearchTerm = searchInput.value;
                filterAndSearchAssets();
            }
        });
    } else {
        if(!searchInput) console.warn("Search input with ID 'searchInput' not found.");
        if(!searchButton) console.warn("Search button not found (expected ID 'search-action-button' or ensure it exists).");
    }


    if (filterBtnAll) filterBtnAll.classList.add('active');
    filterAndSearchAssets();
});