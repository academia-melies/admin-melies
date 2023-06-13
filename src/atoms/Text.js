import { Typography } from "@mui/material";
import { Colors } from "../organisms";

export const Text = (props) => {

   const {
      children,
      light = false,
      bold = false,
      xsmall = false,
      small = false,
      large = false,
      title = false,
      center = false,
      secundary = false,
      style = {}
   } = props;

   return (
      <Typography
         {...props}
         sx={{
            fontFamily: "'Metropolis Regular', Helvetica, Arial, Lucida, sans-serif",
            fontSize: { xs: `12px`, xm: `15px`, md: `15px`, lg: `15px` },
            ...(light && { fontFamily: 'Metropolis Light' }),
            ...(bold && { fontWeight: 'Metropolis Bold' }),
            ...(xsmall && { fontSize: { xs: `8px`, sm: `11px`, md: `11px`, lg: `11px` } }),
            ...(small && { fontSize: { xs: `10px`, sm: `13px`, md: `13px`, lg: `13px` } }),
            ...(large && { fontSize: { xs: `15px`, sm: `18px`, md: `18px`, lg: `18px` } }),
            ...(title && { fontSize: { xs: `18px`, sm: `22px`, md: `22px`, lg: `22px` } }),
            ...(center && { textAlign: 'center' }),
            ...(secundary && { color: Colors.backgroundPrimary + '77' }),
            ...style
         }}
      >
         {children}
      </Typography>
   )
}