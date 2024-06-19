import { createTag } from '../../scripts/utils.js';

export function showErrorToast(msg) {
  console.log(msg);
  document.querySelector('.interactive-enabled .layer .alert-toast .alert-text').innerText = msg;
  document.querySelector('.interactive-enabled .layer .alert-toast').style.display = 'flex';
}

export default function createErrorToast() {
  const errdom = createTag('div', { class: 'alert-toast'});
  errdom.innerHTML = `
  <div class='alert-content'>
    <div class='alert-icon'>
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
      <defs>
        <style>
          .fill {
            fill: white;
          }
        </style>
      </defs>
      <title>S Alert 18 N</title>
      <rect id="Canvas" fill="white" opacity="0" width="18" height="18" /><path class="fill" d="M8.5635,1.2895.2,16.256A.5.5,0,0,0,.636,17H17.364a.5.5,0,0,0,.436-.744L9.4365,1.2895a.5.5,0,0,0-.873,0ZM10,14.75a.25.25,0,0,1-.25.25H8.25A.25.25,0,0,1,8,14.75v-1.5A.25.25,0,0,1,8.25,13h1.5a.25.25,0,0,1,.25.25Zm0-3a.25.25,0,0,1-.25.25H8.25A.25.25,0,0,1,8,11.75v-6a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25Z" />
    </svg>
    </div>
    <div class='alert-text'>
      Alert Text
    </div>
  </div>
  <div class='alert-close'>
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
      <defs>
        <style>
          .fill {
            fill: white;
          }
        </style>
      </defs>
      <title>S Close 18 N</title>
      <rect id="Canvas" fill="white" opacity="0" width="18" height="18" /><path class="fill" d="M13.2425,3.343,9,7.586,4.7575,3.343a.5.5,0,0,0-.707,0L3.343,4.05a.5.5,0,0,0,0,.707L7.586,9,3.343,13.2425a.5.5,0,0,0,0,.707l.707.7075a.5.5,0,0,0,.707,0L9,10.414l4.2425,4.243a.5.5,0,0,0,.707,0l.7075-.707a.5.5,0,0,0,0-.707L10.414,9l4.243-4.2425a.5.5,0,0,0,0-.707L13.95,3.343a.5.5,0,0,0-.70711-.00039Z" />
    </svg>
  </div>`;

  errdom.querySelector('.alert-close').addEventListener('click', (e) => {
    e.target.closest('.alert-toast').style.display = 'none';
  });

  return errdom;
}
