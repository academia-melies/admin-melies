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
      indicator = false,
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
            fontSize: { xs: `12px`, xm: `12px`, md: `12px`, lg: `12px`, xl: '15px' },
            ...(light && { fontFamily: 'MetropolisLight', }),
            ...(bold && { fontFamily: 'MetropolisBold' }),
            ...(xsmall && { fontSize: { xs: `10px`, sm: `10px`, md: `11px`, lg: `11px`, xl: '11px' } }),
            ...(small && { fontSize: { xs: `10px`, sm: `10px`, md: `10px`, lg: `11px`, xl: `12px` } }),
            ...(large && { fontSize: { xs: `14px`, sm: `14px`, md: `14px`, lg: `14px`, xl: `18px` } }),
            ...(veryLarge && { fontSize: { xs: `22px`, sm: `18px`, md: `18px`, lg: `18px`, xl: `27px` } }),
            ...(indicator && { fontSize: { xs: `22px`, sm: `25px`, md: `25px`, lg: `28px`, xl: `30px` } }),
            ...(title && { fontSize: { xs: `18px`, sm: `18px`, md: `18px`, lg: `18px`, xl: `22px` } }),
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