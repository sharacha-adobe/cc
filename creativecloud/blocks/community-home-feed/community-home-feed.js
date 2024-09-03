function loadMoreCommunities() {
    try{
        console.log("load more called");
        var x = document.getElementsByClassName("hide-cards");
        if (x.length > 0) {  
            const loadText = document.querySelector('#load-more-coms');
            
            if (loadText.classList.contains("load-more-text")) {
                Array.from(x).slice(0, 16).forEach(function(element) {
                    element.classList.remove("hide-cards");
                });

                loadText.classList.remove("load-more-text");
                
                if (x.length === 0) {
                    loadText.style.display = "none";
                } else {
                    loadText.textContent = "Load all communities";
                }
            } else {
                Array.from(x).forEach(function(element) {
                    element.classList.remove("hide-cards");
                });

                loadText.style.display = "none";
            }
        }
    }catch(err){
        console.log(err);
    }		
}

function showFilters(){
    try{
        let y = document.getElementById("all-cat");
        var x = document.getElementById("home-filter-list");  
        if(x || y){
            if (x.style.display === "none") {
                x.style.display = "flex";
                y.classList.add("drop-down-open");
            } else {
                x.style.display = "none";
                y.classList.remove("drop-down-open");
            }
        }                                                  
    }catch(err){
        console.log(err);
    }
}

function sortDDClick(sortType) {
    try {
        console.log("sort clicked", sortType);
        let selectedSortId = 'sort-'+sortType;
        var sortSelected = document.getElementById(selectedSortId);
        document.querySelector('.home-filter-dropdown.selected')?.classList.remove('selected');

        if (sortSelected.classList.contains('selected')) {
            sortSelected.classList.remove('selected');
        } else {
            sortSelected.classList.add('selected');
        }

        // const filters = document.querySelector('.filter-button.selected')?.getAttribute('filter-id');
    } catch (err) {
        console.error(err);
    }
}

export default async function init(el) {
    const res = await fetch('https://community-dev.adobe.com/wsyco67866/plugins/custom/adobe/adobedxdev/new-home-feed-data-fetch');
    const html = await res.text();

    const header = document.createElement('div');
    header.classList.add('channel-view-header');
    const list = document.createElement('div');
    list.id = 'channel-view-list';
    list.innerHTML = html;

    el.appendChild(header);
    el.appendChild(list);
  
    const loadMoreDiv = el.querySelector('#load-more-coms');
    loadMoreDiv.onclick = function() {
        loadMoreCommunities();
    };

    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'filter-wrapper';
    header.appendChild(filterWrapper);

    const filterDescription = document.createElement('div');
    filterDescription.className = 'filter-description';
    filterDescription.textContent = 'More to discover';
    filterWrapper.appendChild(filterDescription);

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterWrapper.appendChild(filterContainer);

    const feedFilterSortButtons = document.createElement('div');
    feedFilterSortButtons.className = 'feed-filter-sort-buttons';
    filterContainer.appendChild(feedFilterSortButtons);

    const allCatDropdown = document.createElement('div');
    allCatDropdown.id = 'all-cat-dropdwon';
    feedFilterSortButtons.appendChild(allCatDropdown);

    const allCat = document.createElement('div');
    allCat.className = 'home-filter-dropdown all-cat';
    allCat.id = 'all-cat';
    allCat.setAttribute('onclick', 'showFilters()');
    allCatDropdown.appendChild(allCat);

    const allCatDiv = el.querySelector('#all-cat');
    allCatDiv.onclick = function() {
        showFilters();
    };

    const filterDropdownLabel = document.createElement('span');
    filterDropdownLabel.id = 'filter-dropdown-label';
    filterDropdownLabel.textContent = 'All categories';
    allCat.appendChild(filterDropdownLabel);

    const dropdownChevron = document.createElement('span');
    dropdownChevron.className = 'dropdown-chevron';
    allCat.appendChild(dropdownChevron);

    const sortDesktopView = document.createElement('ul');
    sortDesktopView.className = 'sort-desktop-view';
    sortDesktopView.id = 'm0-sort-dd';
    feedFilterSortButtons.appendChild(sortDesktopView);

    const sortValues = ['featured', 'popular', 'alphabetical', 'latest'];

    sortValues.forEach((sort_type, index) => {
        const listItem = document.createElement('li');
        listItem.className = `home-filter-dropdown ${sort_type === 'featured' ? 'selected' : ''}`;
        listItem.id = `sort-${sort_type}`;
        listItem.setAttribute('item-id', `item-${index}`);
        listItem.setAttribute('item-value', sort_type);
        // listItem.setAttribute('onclick', `sortDDClick('${sort_type}')`);
        
        const textKey = sort_type === 'latest' ? '_activity' : '';
        listItem.textContent = `${sort_type}${textKey}`;
        
        sortDesktopView.appendChild(listItem);
    });

    const sortDiv = el.querySelectorAll('.sort-desktop-view .home-filter-dropdown');
    sortDiv.forEach((element) => {
        element.addEventListener('click', function(event) {
            const sortType = event.target.getAttribute('item-value');
            sortDDClick(sortType);
        });
    });

    const filterListContainer = document.createElement('div');
    filterListContainer.style.display = 'none';
    filterListContainer.className = 'home-filter-list-container';
    filterListContainer.id = 'home-filter-list';
    filterContainer.appendChild(filterListContainer);

    const resp = await fetch('https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/Authorings/homefilters.json');
    const {data} = await resp.json();
    
    if(data.length > 0){

        data.forEach(element => {
            const filterDirectLink = document.createElement('div');
            filterDirectLink.className = 'filter-direct-link';
            
            const filterButton = document.createElement('div');
            filterButton.className = `filter-button ${element['filterId']} ${element['filterId'] === 'filter-10' ? 'selected' : ''}`;
            filterButton.setAttribute('data-id', element['filterId']);
            filterButton.setAttribute('filter-id', element['id']);
            filterButton.setAttribute('onclick', 'checkFunction(3,event)');
            
            const filterIcon = document.createElement('span');
            filterIcon.className = 'filter-icon';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = element['icon'];
            filterIcon.appendChild(tempDiv.firstChild);
            
            const filterLabel = document.createElement('span');
            filterLabel.className = 'filter-label spectrum-Body4';
            filterLabel.textContent = element['text'];
            
            filterButton.appendChild(filterIcon);
            filterButton.appendChild(filterLabel);
            filterDirectLink.appendChild(filterButton);
            filterListContainer.appendChild(filterDirectLink);
        });
    }
}

