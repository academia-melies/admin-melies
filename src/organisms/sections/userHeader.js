import { useState } from "react";
import { Box, Button, Text } from "../../atoms";
import { Colors } from "../layout/Colors";
import { Avatar } from "@mui/material";

export const UserHeader = (props) => {
    const {
        title = '',
    } = props;


    return (
        <>
            <Box sx={styles.header}>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url('/icons/notification_icon.PNG')`,
                    width: 15,
                    height: 17,
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
        display: 'flex',
        width: '100%',
        padding: `13px 32px`,
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxSizing: 'border-box',
        gap: 1,
        position: 'absolute',
        backgroundColor: Colors.backgroundPrimary + '05',
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
