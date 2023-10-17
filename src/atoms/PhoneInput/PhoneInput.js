import React from 'react';
import PhoneInput from 'react-phone-number-input';
import { useAppContext } from '../../context/AppContext';
import { Box } from '../Box';
import 'react-phone-number-input/style.css';
import { Text } from '../Text';
import { useMediaQuery, useTheme } from '@mui/material';

export const PhoneInputField = (props) => {

    const {
        InputProps = {}, label = '', InputLabelProps = {}, bold = false
    } = props;

    const { colorPalette, theme } = useAppContext()
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('xl'))

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            borderRadius: '8px',
            border: `1px solid #00000040`,
            color: colorPalette.textColor,
            // backgroundColor: colorPalette.inputColor,
            display: 'inline-flex',
            flexDirection: 'column',
            position: 'relative',
            minWidth: 0,
            padding: 0,
            margin: 0,
            border: 0,
            verticalAlign: 'top',
            flex: 1,
            '&hover': {
                border: `1px solid #00000080`
            }
        }}>
            <Text bold style={{
                fontSize: '11px',
                display: 'block',
                transformOrigin: 'top left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 'calc(133% - 32px)',
                position: 'absolute',
                left: 12,
                backgroundColor: 'inherit',
                top: -8,
                zIndex: 999
            }}>{label}</Text>

            <PhoneInput
                label={label}
                {...props}
                defaultCountry="BR"
                style={{
                    fontWeight: '400',
                    padding: '0 0 0 8px',
                    border: theme ? `1px solid #00000040` : `1px solid ${colorPalette.inputColor}`,
                    fontSize: '1rem',
                    lineHeight: '1.4375em',
                    letterSpacing: '0.00938em',
                    color: colorPalette.textColor,
                    boxSizing: 'border-box',
                    position: 'relative',
                    cursor: 'text',
                    display: '-webkit-inline-box',
                    display: '-webkit-inline-flex',
                    display: '-ms-inline-flexbox',
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxAlign: 'center',
                    position: 'relative',
                    borderRadius: '4px',
                    transition: 'background-color 1s',
                    borderRadius: '8px',
                    fontFamily: 'MetropolisRegular',
                    backgroundColor: colorPalette.inputColor,
                    height: '45px',
                }}
            />
        </Box >

    )
}