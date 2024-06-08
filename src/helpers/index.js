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
export const formatTimeStamp = (timestamp, time) => {
   try {
      
      if (timestamp) {
         const date = new Date(timestamp);
         date.setHours(date.getHours() + 3);
         
         if (timestamp && time) {
            const options = {
               year: 'numeric',
               month: '2-digit',
               day: '2-digit',
               hour: '2-digit',
               minute: '2-digit',
               second: '2-digit'
            };
            console.log('aqui',date.toLocaleString('pt-BR', options))
            return date.toLocaleString('pt-BR', options);
         } else {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear());
       
            return `${day}/${month}/${year}`;
         }
      }
   } catch (error) {
      return null;
   }
};
/* export const formatTimeStamp = (timestamp, time) => {
   try {
      if (timestamp && time) {
         const date = new Date(timestamp);
         // date.setHours(date.getHours() - 3); 
         const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Sao_Paulo'
         };
         return date.toLocaleString('pt-BR', options);
      }
      if (timestamp) {
         const date = new Date(timestamp);
         const day = String(date.getDate()).padStart(2, '0');
         const month = String(date.getMonth() + 1).padStart(2, '0');
         const year = String(date.getFullYear());

         return `${day}/${month}/${year}`;
      }
   } catch (error) {
      return null
   }
}; */

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

   const cleanedRG = rg.replace(/\W/g, '');
   const rgRegex = /^([0-9a-zA-Z]{2})([0-9a-zA-Z]{3})([0-9a-zA-Z]{3})([0-9a-zA-Z]{1})$/;
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

export const formatCreditCardNumber = (number) => {
   // Remove todos os espaços e caracteres não numéricos
   const cleanNumber = number.replace(/\D/g, '');

   // Adiciona um espaço a cada quatro dígitos
   const formattedNumber = cleanNumber.replace(/(\d{4})/g, '$1 ');

   return formattedNumber.trim(); // Remove espaços extras no final
}

export const formattedStringInDate = (str) => {

   if (str) {

      const dateString = str;
      const dateParts = dateString.split('/');

      const year = parseInt(dateParts[2], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[0], 10);

      // Definindo a hora para 12:00:00
      const hours = 12;
      const minutes = 0;
      const seconds = 0;

      const timestamp = new Date(year, month, day, hours, minutes, seconds).getTime();
      return timestamp
   }
   return null
}

export const formatValueReal = (value) => {
   const rawValue = String(value);
   let intValue = rawValue.split('.')[0] || '0'; // Parte inteira
   const decimalValue = rawValue.split('.')[1]?.padEnd(2, '0') || '00'; // Parte decimal
   const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
   return formattedValue;
}

export const formatTimeAgo = (timestamp, includeTime = false) => {
   const now = new Date();
   const date = new Date(timestamp);
   const diffInSeconds = Math.floor((now - date) / 1000);

   if (diffInSeconds < 60) {
      return 'agora mesmo';
   }

   const diffInMinutes = Math.floor(diffInSeconds / 60);

   if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
   }

   const diffInHours = Math.floor(diffInMinutes / 60);

   if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
   }

   const diffInDays = Math.floor(diffInHours / 24);

   if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
   }

   const diffInMonths = Math.floor(diffInDays / 30);

   return `${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'} atrás`;
};


