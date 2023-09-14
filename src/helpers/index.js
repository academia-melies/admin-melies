import axios from "axios";

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

export const formatCPF = (cpf) => {

   const cleanedCPF = cpf.replace(/\D/g, '');
   const cpfRegex = /^(\d{3})(\d{3})(\d{3})(\d{2})$/;
   const formattedCPF = cleanedCPF.replace(cpfRegex, '$1.$2.$3-$4');

   return formattedCPF;
}

export const formatCNPJ = (cnpj) => {

   const cleanedCNPJ = cnpj.replace(/\D/g, '');
   const cnpjRegex = /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/;
   const formattedCNPJ = cleanedCNPJ.replace(cnpjRegex, '$1.$2.$3/$4-$5');
   // XX.XXX.XXX/0001-XX
   return formattedCNPJ;
}



export const formatDate = (date) => {
   try {
   const newDate = new Date(date)
   const formattedDate = new Intl.DateTimeFormat("pt-BR")?.format(newDate);
   return formattedDate;
} catch (error) {
      return null
}
};


export const formatRg = (rg) => {

   const cleanedRG = rg.replace(/\D/g, '');
   const rgRegex = /^(\d{2})(\d{3})(\d{3})(\d{1})$/;
   const formattedRG = cleanedRG.replace(rgRegex, '$1.$2.$3-$4');

   return formattedRG;
}

export const formatCEP = (cep) => {

   const cleanedCEP = cep.replace(/\D/g, '');
   const cepRegex = /^(\d{5})(\d{3})$/;
   const formattedCEP = cleanedCEP.replace(cepRegex, '$1-$2');

   return formattedCEP;
}

export const formatReal = (valor) => {
   if (typeof valor !== 'number') {
      return '';
   }

   const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
   });

   return formatter.format(valor);
};

export async function findCEP(cep) {
   try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
      const { data } = response;
      return data;

      // setUserData((prevValues) => ({
      //    ...prevValues,
      //    rua: data.logradouro,
      //    cidade: data.localidade,
      //    uf: data.uf,
      //    bairro: data.bairro,
      // }))
   } catch (error) {
      return error
   }

}

export const calculationAge = (dateOfBirth) => {
   const currentDate = new Date();
   const birthDate = new Date(dateOfBirth);

   // Calculating the age difference
   let ageDifference = currentDate.getFullYear() - birthDate.getFullYear();

   // Check if the birthday hasn't occurred yet this year
   if (
     currentDate.getMonth() < birthDate.getMonth() ||
     (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
   ) {
     ageDifference--;
   }

   // Checking if the user is 18 years or older
   return ageDifference >= 18;
}
