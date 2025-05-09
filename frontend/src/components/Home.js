import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Select, MenuItem, Box,
  TextField, Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const [grid, setGrid] = useState({ widths: [], heights: [], prices: [] });
  const [selectedHeight, setSelectedHeight] = useState('');
  const [selectedWidth, setSelectedWidth] = useState('');
  const [editing, setEditing] = useState({ row: null, col: null });
  const [value, setValue] = useState('');
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newRowPrices, setNewRowPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch(`${apiBaseUrl}/api/prices`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json()
      })
      .then((data) => {
        setGrid(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError('Failed to load price grid. Please try again later.');
        setLoading(false);
      });
  };

  const heightIndex = grid.heights.indexOf(Number(selectedHeight));
  const widthIndex = grid.widths.indexOf(Number(selectedWidth));

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddColumn = () => {
    if (!newWidth) return;
  
    fetch(`${apiBaseUrl}/api/add-column`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newWidth: Number(newWidth) }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json()
    })
    .then(data => {
      setGrid(data);
      setNewWidth('');
    })
    .catch((err) => {
      console.error('Error add column on the table:', err);
      showSnackbar(err.message || 'An error occurred while adding column', 'error');
    });
  };

  const handleAddRow = () => {
    if (!newHeight || newRowPrices.length !== grid.widths.length) return;
  
    fetch(`${apiBaseUrl}/api/add-row`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newHeight: Number(newHeight),
        prices: newRowPrices.map(Number),
      }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      return res.json()
    })
    .then(data => {
      setGrid(data);
      setNewHeight('');
      setNewRowPrices([]);
    })
    .catch((err) => {
      console.error('Error add row on the table:', err);
      showSnackbar(err.message || 'An error occurred while adding row', 'error');
    });
  };

  const handleCellClick = (rowIndex, colIndex, currentValue) => {
    setEditing({ row: rowIndex, col: colIndex });
    setValue(currentValue);
  };

  const saveValue = async () => {
    if (value === '' || isNaN(value)) return;
    await fetch(`${apiBaseUrl}/api/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        row: editing.row,
        col: editing.col,
        newValue: Number(value)
      })
    });
    setEditing({ row: null, col: null });
    fetchData();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveValue();
  };

  return (
    <>
      <Box sx={{ padding: '2rem' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <>
            <Typography variant="h5" align="center" gutterBottom>
              Price Grid
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
              <Box>
                <Typography variant="subtitle2">Filter by Height:</Typography>
                <Select
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  value={selectedHeight}
                  displayEmpty
                  onChange={(e) => setSelectedHeight(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="">All</MenuItem>
                  {grid.heights.map((h) => (
                    <MenuItem key={h} value={h}>{h}"</MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <Typography variant="subtitle2">Filter by Width:</Typography>
                <Select
                  value={selectedWidth}
                  displayEmpty
                  onChange={(e) => setSelectedWidth(e.target.value)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="">All</MenuItem>
                  {grid.widths.map((w) => (
                    <MenuItem key={w} value={w}>{w}"</MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#d7e1f6', borderRight: 'none', borderBottom: 0.5 }}>
                      HEIGHT TO ↓ / WIDTH TO →
                    </TableCell>
                    {(selectedWidth === ''
                      ? grid.widths
                      : [grid.widths[widthIndex]]
                    ).map((w, i) => (
                      <TableCell
                        key={i}
                        sx={{ fontWeight: 'bold', backgroundColor: '#d7e1f6', borderLeft: 'none', borderRight: 'none', borderBottom: 0.5 }}
                        align="center"
                      >
                        {w}"
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(selectedHeight === ''
                    ? grid.heights.map((h, i) => ({ h, row: grid.prices[i], rowIndex: i }))
                    : [{ h: grid.heights[heightIndex], row: grid.prices[heightIndex], rowIndex: heightIndex }]
                  ).map((rowData, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      sx={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#d7e1f6a1' }}
                    >
                      <TableCell sx={{ fontWeight: 'bold' }}>{rowData.h}"</TableCell>
                      {(selectedWidth === ''
                        ? rowData.row.map((price, colIndex) => ({
                            price,
                            colIndex
                          }))
                        : [{ price: rowData.row[widthIndex], colIndex: widthIndex }]
                      ).map(({ price, colIndex }) => (
                        <TableCell
                          key={colIndex}
                          align="center"
                          onClick={() => handleCellClick(rowData.rowIndex, colIndex, price)}
                          sx={{ borderLeft: 'none', borderRight: 'none' }}
                        >
                          {editing.row === rowData.rowIndex && editing.col === colIndex ? (
                            <input
                              autoFocus
                              value={value}
                              onChange={(e) => setValue(e.target.value)}
                              onBlur={saveValue}
                              onKeyDown={handleKeyDown}
                              style={{
                                width: '60px',
                                fontSize: '1rem',
                                textAlign: 'center'
                              }}
                            />
                          ) : (
                            `$${price}`
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={4} display="flex" gap={4} justifyContent="center">
              <Box>
                <Typography variant="subtitle2">Add New Column (Width)</Typography>
                <TextField
                  label="Width"
                  size="small"
                  value={newWidth}
                  onChange={(e) => setNewWidth(e.target.value)}
                  type="number"
                />
                <Button onClick={handleAddColumn} variant="contained" size="small" sx={{ mt: 1 }}>
                  Add Column
                </Button>
              </Box>

              <Box>
                <Typography variant="subtitle2">Add New Row (Height)</Typography>
                <TextField
                  label="Height"
                  size="small"
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
                  type="number"
                />
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {grid.widths.map((_, i) => (
                    <TextField
                      key={i}
                      label={`Price ${i + 1}`}
                      size="small"
                      value={newRowPrices[i] || ''}
                      onChange={(e) => {
                        const updated = [...newRowPrices];
                        updated[i] = e.target.value;
                        setNewRowPrices(updated);
                      }}
                      type="number"
                      sx={{ width: 80 }}
                    />
                  ))}
                </Box>
                <Button onClick={handleAddRow} variant="contained" size="small" sx={{ mt: 1 }}>
                  Add Row
                </Button>
              </Box>
            </Box> 
          </>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Home;