import { TextField } from "@mui/material";
import { Colors } from "../organisms";
import { useAppContext } from "../context/AppContext";
import InputAdornment from '@mui/material/InputAdornment';
import { Box } from "./Box";
import { Text } from "./Text";


export const TextInput = (props) => {
   const { InputProps = {}, label = '', bold = false, InputLabelProps = {}, small = false } = props;
   const { colorPalette } = useAppContext();

   return (
      <TextField
         autoComplete='off'
         id="fieldssss"
         label={label}
         {...props}
         InputProps={{
            autocomplete: 'no',
            autoComplete: 'off',
            form: {
               autocomplete: 'off',
            },
            sx: {
               transition: 'background-color 1s',
               disableUnderline: true,
               borderRadius: 2,
               fontSize: small ? '12px' : { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' },
               fontFamily: bold ? 'MetropolisBold' : 'MetropolisRegular',
               ...InputProps?.style,
               color: colorPalette.textColor,
               backgroundColor: colorPalette.inputColor,
               maxHeight: props.multiline ? 'none' : '45px',
            },

            startAdornment: props.type === "coin" && (
               <InputAdornment position="start">
                  <Text>R$ </Text>
               </InputAdornment>
            ),
         }}
         InputLabelProps={
            props.type === "date" || props.type === "datetime-local"
               ? {
                  shrink: true,
                  style: {
                     color: colorPalette.textColor,
                     fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '13px', xl: '14px' },
                     fontFamily: 'MetropolisBold',
                     zIndex: 99
                  },
                  sx: {
                     zIndex: 99
                  }
               }
               : {
                  sx: {
                     color: colorPalette.textColor,
                     fontSize: {
                        xs: '16px',
                        xm: '13px',
                        md: '13px',
                        lg: '13px',
                        xl: '14px'
                     },
                     fontFamily: 'MetropolisBold',
                     zIndex: 99,
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
      display: 'block',
      fontSize: { xs: '13px', xm: '13px', md: '13px', lg: '14px', xl: '15px' },
      fontFamily: 'MetropolisBold',
   }
}