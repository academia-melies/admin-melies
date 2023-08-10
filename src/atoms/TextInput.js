import { TextField } from "@mui/material";
import { Colors } from "../organisms";
import { useAppContext } from "../context/AppContext";


export const TextInput = (props) => {
   const { InputProps = {}, label = '', bold = false, InputLabelProps = {} } = props;
   const { colorPalette } = useAppContext();

   return (
      <TextField
         label={label}
         {...props}
         InputProps={{
            sx: {
               transition: 'background-color 1s',
               disableUnderline: true,
               borderRadius: 2,
               fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' },
               fontFamily: bold ? 'MetropolisBold' : 'MetropolisRegular',
               color: colorPalette.textColor,
               backgroundColor: colorPalette.inputColor,
               ...InputProps?.style,
            },
         }}
         InputLabelProps={
            props.type === "date"
               ? {
                  shrink: true, // Faz com que o rótulo encolha como se estivesse focado
                  style: {
                     color: colorPalette.textColor,
                     fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' },
                     fontFamily: 'MetropolisBold',
                     zIndex: 999
                  },
               }
               : {
                  sx: {
                     color: colorPalette.textColor,
                     fontSize: {
                        xs: '14px',
                        xm: '15px',
                        md: '15px',
                        lg: '15px'
                     },
                     fontFamily: 'MetropolisBold',
                     zIndex: 999,
                     ...InputLabelProps?.style
                  }
               }
         }
      />
   );
};

const styles = {
   date: {
      // display: 'none',
      display: 'block', // Exibe o rótulo como um elemento de bloco
      fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' },
      fontFamily: 'MetropolisBold',
   }
}