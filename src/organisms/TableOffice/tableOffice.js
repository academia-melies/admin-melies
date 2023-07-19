import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { TextInput } from '../../atoms';
import { useAppContext } from '../../context/AppContext';

export const TableOfficeHours = (props) => {
    const { data = [], onChange } = props;
    const { colorPalette, theme } = useAppContext();
    
    const daysWeek = ['2ª Feira', '3ª Feira', '4ª Feira', '5ª Feira', '6ª Feira', 'Sábado'];

    // Time periods to loop through (Entrada and Saída)
    const timePeriods = ['ent1', 'sai1', 'ent2', 'sai2', 'ent3', 'sai3'];

    const handleChange = (event, diaSemana, key) => {
        const { value } = event.target;

        // Filtra apenas os números
        const onlyNumbers = value.replace(/\D/g, '');

        // Aplica a máscara no formato HH:mm
        let maskedValue = onlyNumbers;
        if (onlyNumbers.length > 2) {
            maskedValue = `${onlyNumbers.slice(0, 2)}:${onlyNumbers.slice(2, 4)}`;
        } else if (onlyNumbers.length > 0) {
            maskedValue = `${onlyNumbers}`;
        }

        // Crie um objeto com os dados atualizados para o dia da semana selecionado
        const updatedData = data.map((row) => ({
            ...row,
            [key]: row.dia_semana === diaSemana ? maskedValue : row[key],
        }));

        // Chame a função onChange passando os dados atualizados
        onChange(updatedData);
    };

    return (
        <Paper sx={{ backgroundColor: theme ? '#fff' : colorPalette.primary, transition: 'background-color 1s', }}>
            <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: colorPalette.buttonColor }}>
                            <TableCell></TableCell>
                            {daysWeek.map((dia) => (
                                <TableCell key={dia} sx={{ color: '#fff', fontFamily: 'MetropolisBold', textAlign: 'center' }}>
                                    {dia}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timePeriods.map((periodo, periodoIndex) => (
                            <TableRow key={periodo}>
                                <TableCell sx={{ backgroundColor: colorPalette.primary, minWidth: '130px', fontFamily: 'MetropolisBold', color: colorPalette.textColor }}>
                                    {periodoIndex % 2 === 0 ? 'Entrada' : 'Saída'} {Math.floor(periodoIndex / 2) + 1}
                                </TableCell>
                                {data.map((row, diaIndex) => (
                                    <TableCell key={diaIndex}>
                                        <TextInput
                                            name={row.dia_semana}
                                            value={row[periodo]}
                                            onChange={(event) => handleChange(event, row.dia_semana, periodo)}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};
