import { Box, Text } from "../../atoms";
import React from "react";
import { useAppContext } from "../../context/AppContext";

export const LoadingIcon = (props) => {

    const { colorPalette } = useAppContext()

    return (
        <>
            <Box sx={styles.backdrop}>
                <Box sx={styles.favicon} />
                <Text bold sx={{color: '#fff'}}>Carregando...</Text>
            </Box>
        </>
    )
}

const styles = {
    backdrop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    boxLoading: {
        position: 'relative',
        width: 150,
        height: 100,
    },
    favicon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundImage: `url('/favicon.svg')`,
        backgroundSize: 'contain',
        width: 180,
        height: 120,
        animation: 'fadeInOut 1.8s ease-in-out infinite',
        '@keyframes fadeInOut': {
            '0%': {
                opacity: 0,
            },
            '50%': {
                opacity: 1,
            },
            '100%': {
                opacity: 0,
            }
        }
    },
}