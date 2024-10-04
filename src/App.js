import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  List,
  ListItem,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt'; // Import the camera icon

function App() {
  const [name, setName] = useState('');
  const [rawVolume, setRawVolume] = useState('');
  const [rawPrice, setRawPrice] = useState('');
  const [image, setImage] = useState(null);
  const [softeners, setSofteners] = useState([]);
  const [removedSoftener, setRemovedSoftener] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [openImage, setOpenImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [lastAction, setLastAction] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [softenerToDelete, setSoftenerToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('pricePerMl');

  // Helper Functions

  // Calculate price per milliliter
  const calculatePricePerMl = (softener) => softener.price / softener.volume;

  // Format volume, converting to liters if over 1000 ml
  const formatVolume = (volume) =>
    volume >= 1000
      ? `${volume.toLocaleString()} มิลลิลิตร (${(volume / 1000).toFixed(1)} ลิตร)`
      : `${volume.toLocaleString()} มิลลิลิตร`;

  // Format price with currency symbol
  const formatPrice = (price) => `฿${price.toLocaleString()}`;

  // Format price per milliliter to 2 decimal places
  const formatPricePerMl = (pricePerMl) => `฿${pricePerMl.toFixed(2)}`;

  // Handle image click to show a larger preview
  const handleImageClick = (image) => {
    setOpenImage(image); // Store the image for modal display
  };

  // Handle modal close
  const handleCloseImage = () => {
    setOpenImage(null); // Close modal
  };

  const sortedSofteners = softeners.slice().sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'volume':
        return b.volume - a.volume;  // Sort volume in descending order
      case 'price':
        return a.price - b.price;
      case 'pricePerMl':
        return calculatePricePerMl(a) - calculatePricePerMl(b);
      default:
        return 0;
    }
  });

  // Save or update softener
  const handleSaveSoftener = () => {
    if (!name || !rawVolume || !rawPrice) {
      alert('กรุณากรอกข้อมูล ยี่ห้อ ปริมาณ และ ราคา ให้ครบถ้วน');
      return;
    }

    const newSoftener = {
      id: Date.now(),
      name,
      volume: parseFloat(rawVolume.replace(/\s+/g, '').replace(/,/g, '')),
      price: parseFloat(rawPrice.replace(/\s+/g, '').replace(/,/g, '')),
      image,
    };

    if (editIndex !== null) {
      const updatedSofteners = softeners.map((softener) =>
        softener.id === editIndex ? newSoftener : softener
      );
      setSofteners(updatedSofteners);
      setEditIndex(null);
    } else {
      setSofteners([...softeners, newSoftener]);
      setSnackbarMessage('เพิ่มข้อมูลเรียบร้อยแล้ว!');
      setLastAction('add');
      setSnackbarOpen(true);
    }

    clearInputs();
  };

  const clearInputs = () => {
    setName('');
    setRawVolume('');
    setRawPrice('');
    setImage(null);
  };

  // Remove softener
  const handleRemoveSoftener = (id) => {
    const softener = softeners.find((s) => s.id === id);
    setSoftenerToDelete(softener);
    setConfirmDeleteOpen(true);
  };

  // Handle file input for image (convert to Base64)
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // Store the Base64-encoded image
    };
    if (file) {
      reader.readAsDataURL(file); // Read the image file as a Data URL (Base64)
    }
  };

  const handleConfirmDelete = () => {
    setRemovedSoftener(softenerToDelete);
    setSofteners(softeners.filter((softener) => softener.id !== softenerToDelete.id));
    setSoftenerToDelete(null);
    setConfirmDeleteOpen(false);
    setSnackbarMessage('ลบเรียบร้อยแล้ว!');
    setSnackbarOpen(true);
    setLastAction('remove');
  };

  const handleUndoRemove = () => {
    if (removedSoftener) {
      setSofteners([...softeners, removedSoftener]);
      setRemovedSoftener(null);
    }
    setSnackbarOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setRemovedSoftener(null);
  };

  const handleEditSoftener = (id) => {
    const softener = softeners.find((softener) => softener.id === id);
    setName(softener.name);
    setRawVolume(softener.volume.toString());
    setRawPrice(softener.price.toString());
    setImage(softener.image);
    setEditIndex(id);
  };

  // Clear all softeners with confirmation
  const handleClearAll = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?')) {
      setSofteners([]); // Set the softeners array to an empty array
    }
  };

  // Calculate cheapest and second cheapest prices
  const uniquePrices = [...new Set(sortedSofteners.map((softener) => calculatePricePerMl(softener)))].sort(
    (a, b) => a - b
  );
  const cheapestPrice = uniquePrices[0];
  const secondCheapestPrice = uniquePrices[1];

  return (
    <Container maxWidth="sm">
      <Box sx={{ paddingTop: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Softener Price Check
        </Typography>

        {/* Input Fields */}
        <TextField
          label="ยี่ห้อ"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="ปริมาณ (มิลลิลิตร)"
          variant="outlined"
          fullWidth
          value={rawVolume.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} // Format with commas
          onChange={(e) => setRawVolume(e.target.value.replace(/[^0-9\s]/g, ''))}
          type="tel"
          inputMode="numeric"
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="ราคา (บาท)"
          variant="outlined"
          fullWidth
          value={rawPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} // Format with commas
          onChange={(e) => setRawPrice(e.target.value.replace(/[^0-9\s]/g, ''))}
          type="tel"
          inputMode="numeric"
          sx={{ marginBottom: 2 }}
        />

        {/* File Input for Image */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          <CameraAltIcon sx={{ marginRight: 1 }} />
          เพิ่มรูปภาพ (สามารถเพิ่มได้เพียง 1 รูปภาพ และไม่บังคับ)
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </Button>
        {image && (
          <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
            <img src={image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
          </Box>
        )}

        {editIndex !== null && image && (
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => setImage(null)}  // Clear the image
            sx={{ marginBottom: 2 }}
          >
            ลบรูปภาพ
          </Button>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSaveSoftener}
          disabled={!name || !rawVolume || !rawPrice}
          sx={{ marginBottom: 4 }}
        >
          {editIndex !== null ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'}
        </Button>

        {editIndex !== null && (
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => {
              setEditIndex(null);
              clearInputs();
            }}
            sx={{ marginBottom: 4 }}
          >
            ยกเลิกการแก้ไข
          </Button>
        )}

        {softeners.length > 0 && (
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleClearAll}  // Update this line to use the modified handleClearAll
            disabled={editIndex !== null}
            sx={{ marginBottom: 4 }}
          >
            ลบข้อมูลทั้งหมด
          </Button>
        )}

        {softeners.length > 0 && (
          <>
            {/* Title: รายการน้ำยาปรับผ้านุ่ม */}
            <Typography variant="h6" component="h2" gutterBottom>
              รายการน้ำยาปรับผ้านุ่ม
            </Typography>

            {/* Sort by Dropdown */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="sort-label">Sort by</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="name">ยี่ห้อ</MenuItem>
                  <MenuItem value="volume">ปริมาณ</MenuItem>
                  <MenuItem value="price">ราคา</MenuItem>
                  <MenuItem value="pricePerMl">ราคาต่อมิลลิลิตร</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        )}

        <List>
          {sortedSofteners.map((softener, index) => (
            <ListItem
              key={index}
              sx={{
                marginBottom: 1,
                backgroundColor:
                  calculatePricePerMl(softener) === cheapestPrice
                    ? '#d1f7d1'
                    : calculatePricePerMl(softener) === secondCheapestPrice
                    ? '#fff3cd'
                    : '#f9f9f9',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1"><strong>ยี่ห้อ:</strong> {softener.name}</Typography>
                <Typography variant="body1"><strong>ปริมาณ:</strong> {formatVolume(softener.volume)}</Typography>
                <Typography variant="body1"><strong>ราคา:</strong> {formatPrice(softener.price)}</Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>ราคาต่อมิลลิลิตร:</strong> {formatPricePerMl(calculatePricePerMl(softener))}
                </Typography>
              </Box>

              {softener.image && (
                <Box sx={{ marginLeft: 2 }}>
                  <img
                    src={softener.image}
                    alt="Softener"
                    style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                    onClick={() => handleImageClick(softener.image)}
                  />
                </Box>
              )}

              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditSoftener(softener.id)}
                disabled={editIndex !== null}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveSoftener(softener.id)}
                disabled={editIndex !== null}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>

        <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogContent>
            <Typography>คุณแน่ใจหรือไม่ว่าต้องการลบ {softenerToDelete?.name}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">ยกเลิก</Button>
            <Button onClick={handleConfirmDelete} color="secondary">ลบ</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!openImage} onClose={handleCloseImage}>
          <DialogTitle>ภาพขนาดใหญ่</DialogTitle>
          <DialogContent>{openImage && <img src={openImage} alt="Large Preview" style={{ width: '100%' }} />}</DialogContent>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          action={
            lastAction === 'remove' ? (
              <>
                <Button color="secondary" size="small" onClick={handleUndoRemove}>
                  Undo
                </Button>
                <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                  <CloseIcon />
                </IconButton>
              </>
            ) : (
              <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                <CloseIcon />
              </IconButton>
            )
          }
        />
      </Box>
    </Container>
  );
}

export default App;
