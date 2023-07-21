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
            fontSize: { xs: `14px`, xm: `15px`, md: `13px`, lg: `15px`, xl: '16px' },
            ...(light && { fontFamily: 'MetropolisLight', }),
            ...(bold && { fontFamily: 'MetropolisBold' }),
            ...(xsmall && { fontSize: { xs: `10px`, sm: `10px`, md: `10px`, lg: `10px`, xl: '12px' } }),
            ...(small && { fontSize: { xs: `12px`, sm: `12px`, md: `12px`, lg: `12px`, xl: '14px' } }),
            ...(large && { fontSize: { xs: `15px`, sm: `18px`, md: `15px`, lg: `18px`, xl: '19px' } }),
            ...(veryLarge && { fontSize: { xs: `22px`, sm: `22px`, md: `20px`, lg: `27px`, xl: '30px' } }),
            ...(title && { fontSize: { xs: `18px`, sm: `22px`, md: `20px`, lg: `22px`, xl: '25px' } }),
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