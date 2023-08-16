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
               maxHeight: props.multiline ? 'none' : '45px',
            },
         }}
         InputLabelProps={
            props.type === "date"
               ? {
                  shrink: true,
                  style: {
                     color: colorPalette.textColor,
                     fontSize: { xs: '13px', xm: '14px', md: '14px', lg: '14px' },
                     fontFamily: 'MetropolisBold',
                     zIndex: 99
                  },
                  sx:{
                     zIndex: 99
                  }
               }
               : {
                  sx: {
                     color: colorPalette.textColor,
                     fontSize: {
                        xs: '16px',
                        xm: '14px',
                        md: '14px',
                        lg: '14px'
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
      fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' },
      fontFamily: 'MetropolisBold',
   }
}