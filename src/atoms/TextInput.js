import { TextField } from "@mui/material";
import { Colors } from "../organisms";
import { useAppContext } from "../context/AppContext";


export const TextInput = (props) => {

   const { InputProps = {}, label = '', InputLabelProps = {} } = props;

   const { colorPalette } = useAppContext()

   return (
      <TextField label={label}
         {...props}
         InputProps={{
            sx: { transition: 'background-color 1s', borderRadius: 2, fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' }, fontFamily: 'InterRegular',  ...InputProps?.style, color: colorPalette.textColor, backgroundColor: colorPalette.inputColor }
         }}
         InputLabelProps={{ 
            sx: { color: '#888' , fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' }, ...InputLabelProps?.style} 
         }}
      />
   )
}