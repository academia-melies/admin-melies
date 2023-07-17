import { icons } from '../organisms/layout/Colors';
import { Box } from './Box';

export const FileInput = (props) => {

    const { children, onClick = () => { }
    } = props;

    return (
        <Box sx={{ ...styles.inputSection, alignItems: 'start', gap: 0.5 }}>
            {children}
            <Box sx={{
                ...styles.menuIcon,
                backgroundImage: `url('${icons.file}')`,
                transition: '.3s',
                "&:hover": {
                    opacity: 0.8,
                    cursor: 'pointer'
                }
            }} onClick={() => onClick(true)} />
        </Box>
    )
}

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
        justifyContent: 'space-around',
        // gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}