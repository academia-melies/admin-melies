import { TextField } from "@mui/material";
import { Colors } from "../organisms";

export const TextInput = (props) => {

   const { InputProps = {} } = props;

   return (
      <TextField
         {...props}
         InputProps={{
            sx: { borderRadius: 2, fontSize: { xs: '12px', xm: '15px', md: '15px', lg: '15px' }, fontFamily: 'InterRegular', ...InputProps?.style }
         }}
         InputLabelProps={{ style: { color: '#888' } }}
      />
   )
}