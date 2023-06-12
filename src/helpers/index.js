
export const getRandomInt = (min, max) => {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min;
}

export const getDialogPosition = (event, maxDialogWidth) => {

   const widthLimit = (document.documentElement.clientWidth - maxDialogWidth) * 1.004;
   const documentHeight = document.documentElement.clientHeight;
   const xOffsetLimit = documentHeight - 180;

   const y = Math.min(xOffsetLimit, event.clientY * 1.1);
   const x = Math.min(widthLimit, event.clientX * 1.02);

   return { left: x, top: y }
}

export const formatTimeStamp = (timestamp) => {
   const date = new Date(timestamp);
 
   const day = String(date.getDate()).padStart(2, '0');
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const year = String(date.getFullYear());
 
   return `${day}/${month}/${year}`;
 };

export const emailValidator = (email) => {
   const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&*'+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
   return EMAIL_REGEX.test(email)
}