import { Typography } from "@mui/material";
import { Colors } from "../organisms";
import { useAppContext } from "../context/AppContext";

export const Text = (props) => {

   const {
      children,
      light = false,
      bold = false,
      xsmall = false,
      small = false,
      large = false,
      veryLarge = false,
      title = false,
      center = false,
      secundary = false,
      style = {},
      sx = {}
   } = props;

   const { colorPalette } = useAppContext()

   return (
      <Typography
         {...props}
         sx={{
            color: colorPalette.textColor,
            transition: 'background-color 1s',
            fontFamily: "'Metropolis Regular', Helvetica, Arial, Lucida, sans-serif, 'Metropolis Bold'",
            fontSize: { xs: `14px`, xm: `15px`, md: `15px`, lg: `15px` },
            ...(light && { fontFamily: 'MetropolisLight', }),
            ...(bold && { fontFamily: 'MetropolisBold' }),
            ...(xsmall && { fontSize: { xs: `8px`, sm: `11px`, md: `11px`, lg: `11px` } }),
            ...(small && { fontSize: { xs: `10px`, sm: `10px`, md: `10px`, lg: `10px` } }),
            ...(large && { fontSize: { xs: `15px`, sm: `18px`, md: `18px`, lg: `18px` } }),
            ...(veryLarge && { fontSize: { xs: `22px`, sm: `22px`, md: `22px`, lg: `27px` } }),
            ...(title && { fontSize: { xs: `18px`, sm: `22px`, md: `22px`, lg: `22px` } }),
            ...(center && { textAlign: 'center' }),
            ...(secundary && { color: Colors.textColor + '77' }),
            ...style,
            ...sx
         }}
      >
         {children}
      </Typography>
   )
}