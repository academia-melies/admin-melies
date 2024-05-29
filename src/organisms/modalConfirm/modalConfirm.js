import { Backdrop } from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { Box, Button, ContentContainer, Divider, Text } from "../../atoms";
import { icons } from "../layout/Colors";

export const ConfirmModal = ({ showExclude, onConfirm, onCancel }) => {
    const { setLoading, colorPalette, theme, user } = useAppContext()
    if (!showExclude.active) return null;

    return (
        <Backdrop open={showExclude?.active} sx={{ zIndex: 9999999 }}>
            <ContentContainer style={{ maxWidth: 400 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                    <Text bold large>{showExclude?.title}</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        width: 15, height: 15,
                        backgroundImage: `url(${icons.gray_close})`,
                        transition: '.3s',
                        zIndex: 999999999,
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={onCancel} />
                </Box>
                <Divider distance={0} />
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Text>{showExclude?.description}</Text>
                    <Divider />

                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                        <Button cancel text="Exluir" style={{ height: 35, width: '100%' }} onClick={() => onConfirm(showExclude.data)} />
                        < Button text="Cancelar" style={{ height: 35, width: '100%' }} onClick={onCancel} />
                    </Box>
                </Box>
            </ContentContainer>
        </Backdrop>
    );
};


const styles = {
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-start',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}