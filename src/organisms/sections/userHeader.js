import { useState } from "react";
import { Box, Button, Text } from "../../atoms";
import { Colors, icons } from "../layout/Colors";
import { Avatar } from "@mui/material";
import { IconTheme } from "../iconTheme/IconTheme";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/router";

export const UserHeader = (props) => {
    const {
        title = '',
    } = props;

    const { colorPalette, theme } = useAppContext()
    const router = useRouter()


    return (
        <>
            <Box sx={{ ...styles.header, backgroundColor: colorPalette.secondary + '88', gap: 3 }}>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url(${icons.gray_arrow_down})`,
                    transform: 'rotate(90deg)',
                    transition: '.3s',
                    width: 17,
                    height: 17,
                    position: 'absolute',
                    left: 260,
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={() => router.back()} />
                <IconTheme flex />
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url('/icons/notification_icon.png')`,
                    width: 20,
                    height: 17,
                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                    transition: 'background-color 1s',
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} />
            </Box>
        </>
    )
}

const styles = {
    header: {
        display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex' },
        width: '100%',
        padding: `3px 32px 3px 32px`,
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxSizing: 'border-box',
        gap: 1,
        position: 'absolute',
        borderBottom: `1px solid ${Colors.backgroundPrimary + '11'}`,
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,

    },
    containerUserOpitions: {
        backgroundColor: '#fff',
        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
        borderRadius: 2,
        padding: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top: 48,
        width: '100%',
        boxSizing: 'border-box',
        zIndex: 9999999

    },
    userBadgeContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 130,
        gap: 1,
        position: 'relative',
        borderRadius: 1.5,
        zIndex: 9999999
    }
}
