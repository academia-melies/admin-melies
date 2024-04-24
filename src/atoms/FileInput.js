import { icons } from '../organisms/layout/Colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box } from './Box';
import CancelIcon from '@mui/icons-material/Cancel';
import { Tooltip } from '@mui/material';

export const FileInput = (props) => {

    const {
        children,
        onClick = () => { },
        style = {},
        left = false,
        existsFiles = false
    } = props;

    return (
        <Box sx={{ ...styles.inputSection, alignItems: 'start', gap: 0.5, flexDirection: left && 'row-reverse', ...style }}>
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
            <div>
                <Tooltip title={existsFiles ? 'Documento preenchido' : 'Sem documentos'}>
                    {existsFiles ?
                        <CheckCircleIcon style={{ color: 'green', fontSize: 17 }} />
                        :
                        <CancelIcon style={{ color: 'red', fontSize: 17 }} />
                    }
                </Tooltip>
            </div>
        </Box >
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
        justifyContent: 'flex-start',
        // gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}