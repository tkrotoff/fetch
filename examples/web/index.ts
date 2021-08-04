import 'core-js/stable';
import 'regenerator-runtime';
import 'whatwg-fetch';

import {
  abortRequestExample,
  del200OKExample,
  downloadProgressExample,
  get200OKExample,
  get404NotFoundExample,
  get500InternalServerErrorExample,
  getCorsBlockedExample,
  postJSON201CreatedExample,
  uploadFilesExample
} from './requests';

document.getElementById(get200OKExample.name)!.onclick = get200OKExample;
document.getElementById(postJSON201CreatedExample.name)!.onclick = postJSON201CreatedExample;
document.getElementById(del200OKExample.name)!.onclick = del200OKExample;
document.getElementById(get404NotFoundExample.name)!.onclick = get404NotFoundExample;
document.getElementById(get500InternalServerErrorExample.name)!.onclick =
  get500InternalServerErrorExample;
document.getElementById(getCorsBlockedExample.name)!.onclick = getCorsBlockedExample;

document.getElementById(uploadFilesExample.name)!.onclick = () => {
  const fileField = document.querySelector(
    'input[type="file"][multiple][name="fileField"]'
  ) as HTMLInputElement;
  uploadFilesExample(fileField.files!);
};

document.getElementById(abortRequestExample.name)!.onclick = abortRequestExample;
document.getElementById(downloadProgressExample.name)!.onclick = downloadProgressExample;
