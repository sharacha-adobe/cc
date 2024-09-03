export default async function init(el) {
    
    const featuredParent = document.createElement('div');
    featuredParent.className = 'featured-parent';

    const leftPaddle = document.createElement('div');
    leftPaddle.id = 'left-paddle';
    leftPaddle.className = 'left-paddle paddle hidden';

    const leftPaddleImg = document.createElement('img');
    leftPaddleImg.loading = 'lazy';
    leftPaddleImg.src = 'https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/images/s2-icon-right-arrow.svg';
    leftPaddleImg.alt = 'scroll-left';
    leftPaddle.appendChild(leftPaddleImg);

    const rightPaddle = document.createElement('div');
    rightPaddle.id = 'right-paddle';
    rightPaddle.className = 'right-paddle paddle hidden';

    const rightPaddleImg = document.createElement('img');
    rightPaddleImg.loading = 'lazy';
    rightPaddleImg.src = 'https://main--cc--sejalnaidu.hlx.page/drafts/snaidu/community/images/s2-icon-left-arrow.svg';
    rightPaddleImg.alt = 'scroll-right';
    rightPaddle.appendChild(rightPaddleImg);

    const featuredCardContainer = document.createElement('div');
    featuredCardContainer.className = 'featured-card-container';

    const featuredHeader = document.createElement('div');
    featuredHeader.className = 'featured-header';

    const featuredTitle = document.createElement('h3');
    featuredTitle.className = 'spectrum-Body1 featured-title';
    featuredTitle.textContent = 'For you';
    featuredHeader.appendChild(featuredTitle);

    const placeholderDivForYou = document.createElement('div');
    placeholderDivForYou.className = 'placeholder-div-for-you';

    const cardsLimit = 5;

    for (let number = 0; number < cardsLimit; number++) {
        const cardWrapper = document.createElement('div');
        cardWrapper.id = `placeholder-div-for-you-${number}`;
        cardWrapper.className = 'featured-card-wrapper';
        if (number === cardsLimit - 1) {
            cardWrapper.classList.add('last');
        }

        const cardBanner = document.createElement('div');
        cardBanner.className = 'channel-card-banner ghost-load-cards';
        cardWrapper.appendChild(cardBanner);

        const channelIcon = document.createElement('div');
        channelIcon.className = 'channel-icon ghost-load-cards';
        cardWrapper.appendChild(channelIcon);

        const cardContent = document.createElement('div');
        cardContent.className = 'channel-card-content';

        const col1 = document.createElement('div');
        col1.className = 'col1';

        const productTitle = document.createElement('div');
        productTitle.className = 'product-title box-style ghost-load-cards';
        col1.appendChild(productTitle);

        const productStats = document.createElement('div');
        productStats.className = 'product-stats';

        const productStatIcon = document.createElement('div');
        productStatIcon.className = 'product-stat-icon box-style ghost-load-cards';
        productStats.appendChild(productStatIcon);

        const productStatCount = document.createElement('div');
        productStatCount.className = 'product-stat-count box-style ghost-load-cards';
        productStats.appendChild(productStatCount);

        col1.appendChild(productStats);
        cardContent.appendChild(col1);

        const col2 = document.createElement('div');
        col2.className = 'col2';

        const visitBtn = document.createElement('div');
        visitBtn.className = 'channel-visit-btn ghost-load-cards';
        col2.appendChild(visitBtn);

        cardContent.appendChild(col2);
        cardWrapper.appendChild(cardContent);

        placeholderDivForYou.appendChild(cardWrapper);
    }

    featuredCardContainer.appendChild(featuredHeader);
    featuredCardContainer.appendChild(placeholderDivForYou);

    featuredParent.appendChild(leftPaddle);
    featuredParent.appendChild(rightPaddle);
    featuredParent.appendChild(featuredCardContainer);

    el.appendChild(featuredParent);
}