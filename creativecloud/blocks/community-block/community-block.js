
export default async function init(el) {
    const res = await fetch('https://main--milo--adobecom.hlx.page/drafts/snaidu/community/book1.json');
    const {data} = await res.json();
    data.forEach(element => {
        console.log(element);
    });
  
}
