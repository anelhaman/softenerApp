import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
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

function App() {
  const [name, setName] = useState('');
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null); // State to store the image as Base64
  const [softeners, setSofteners] = useState([]);
  const [removedSoftener, setRemovedSoftener] = useState(null); // Temporarily store the removed softener
  const [editIndex, setEditIndex] = useState(null); // Track index of item being edited
  const [openImage, setOpenImage] = useState(null); // State to control image modal
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Control for undo snackbar
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // Control for delete confirmation dialog
  const [softenerToDelete, setSoftenerToDelete] = useState(null); // Store softener to be deleted
  const [sortBy, setSortBy] = useState('pricePerMl'); // Default sort by price per milliliter

  // Handle file input for image (convert to Base64)
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // Store the Base64-encoded image and preview it
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Add a new softener or update an existing one
  const handleSaveSoftener = () => {
    if (!name || !volume || !price) {
      alert('กรุณากรอกข้อมูล ยี่ห้อ ปริมาณ และ ราคา ให้ครบถ้วน');
      return;
    }

    const newSoftener = { id: Date.now(), name, volume: parseFloat(volume), price: parseFloat(price), image };

    if (editIndex !== null) {
      // Find the softener to update by its unique id
      const updatedSofteners = softeners.map((softener) =>
        softener.id === editIndex ? newSoftener : softener
      );
      setSofteners(updatedSofteners);
      setEditIndex(null); // Reset edit mode
    } else {
      // Add new softener
      setSofteners([...softeners, newSoftener]);
    }

    // Clear input fields after saving
    setName('');
    setVolume('');
    setPrice('');
    setImage(null);
  };

  // Clear all softeners with confirmation
  const handleClearAll = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?')) {
      setSofteners([]); // Set the softeners array to an empty array
    }
  };

  // Remove a specific softener by id with confirmation
  const handleRemoveSoftener = (id) => {
    const softener = softeners.find((s) => s.id === id);
    setSoftenerToDelete(softener); // Store the softener to delete
    setConfirmDeleteOpen(true); // Open the confirmation dialog
  };

  // Confirm deletion of softener
  const handleConfirmDelete = () => {
    setSofteners(softeners.filter((softener) => softener.id !== softenerToDelete.id));
    setSnackbarOpen(true); // Open the snackbar for undo option
    setSoftenerToDelete(null); // Clear the softener to delete
    setConfirmDeleteOpen(false); // Close the confirmation dialog
  };

  // Undo the softener removal
  const handleUndoRemove = () => {
    if (removedSoftener) {
      setSofteners([...softeners, removedSoftener]);
      setRemovedSoftener(null); // Clear the removed softener after undo
    }
    setSnackbarOpen(false); // Close the snackbar after undo
  };

  // Close the snackbar without undo
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setRemovedSoftener(null); // Clear removed softener if undo is not clicked
  };

  // Edit a specific softener
  const handleEditSoftener = (id) => {
    const softener = softeners.find((softener) => softener.id === id);
    setName(softener.name);
    setVolume(softener.volume);
    setPrice(softener.price);
    setImage(softener.image);
    setEditIndex(id); // Set edit mode to the softener's unique id
  };

  // Calculate price per milliliter
  const calculatePricePerMl = (softener) => {
    return softener.price / softener.volume;
  };

  // Convert volume to liters if over 1000 ml and format with commas
  const formatVolume = (volume) => {
    return volume >= 1000
      ? `${volume.toLocaleString()} มิลลิลิตร (${(volume / 1000).toFixed(1).toLocaleString()} ลิตร)`
      : `${volume.toLocaleString()} มิลลิลิตร`;
  };

  // Format numbers with commas for price and price per milliliter
  const formatPrice = (price) => `฿${price.toLocaleString()}`;
  const formatPricePerMl = (pricePerMl) => `฿${pricePerMl.toFixed(2).toLocaleString()}`;

  // Sort the softeners by price per milliliter in ascending order
  const sortedSofteners = softeners.slice().sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'volume':
        return b.volume - a.volume; // Change this line for descending order
      case 'price':
        return a.price - b.price;
      case 'pricePerMl':
        return calculatePricePerMl(a) - calculatePricePerMl(b);
      default:
        return 0;
    }
  });

  // Get the unique prices and sort them
  const uniquePrices = [...new Set(sortedSofteners.map(softener => calculatePricePerMl(softener)))].sort((a, b) => a - b);
  
  // Get the cheapest and second-cheapest prices
  const cheapestPrice = uniquePrices[0];
  const secondCheapestPrice = uniquePrices[1];

  // Open modal with larger image
  const handleImageClick = (image) => {
    setOpenImage(image);
  };

  // Close modal
  const handleCloseImage = () => {
    setOpenImage(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ paddingTop: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            width: '100%',
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          Softener Price Check
        </Typography>

        {/* Input Fields for Name, Volume, and Price */}
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
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          type="tel" // Ensures number pad on iPhone
          inputMode="numeric" // Specifically tells the browser to use numeric input
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="ราคา (บาท)"
          variant="outlined"
          fullWidth
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="tel" // Ensures number pad on iPhone
          inputMode="numeric" // Specifically tells the browser to use numeric input
          sx={{ marginBottom: 2 }}
        />

        {/* File Input for Image */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          เพิ่มรูปภาพ (สามารถเพิ่มได้เพียง 1 รูปภาพ และไม่บังคับ)
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
          * การเพิ่มรูปภาพเป็นทางเลือก ไม่บังคับ
        </Typography>

        {/* Show preview of the image if selected */}
        {image && (
          <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
            <img src={image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
          </Box>
        )}

        {/* Add/Save Softener Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSaveSoftener}
          disabled={!name || !volume || !price} // Disable button if any field is empty
          sx={{ marginBottom: 4 }}
        >
          {editIndex !== null ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'} {/* Change button text based on edit mode */}
        </Button>

        {/* Clear All Button */}
        {softeners.length > 0 && (
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleClearAll}
            disabled={editIndex !== null} // Disable button if in edit mode
            sx={{ marginBottom: 4 }}
          >
            ลบข้อมูลทั้งหมด
          </Button>
        )}

        {/* Show sorting dropdown only if there are softeners */}
        {softeners.length > 0 && (
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
                <MenuItem value="pricePerMl">ราคาต่อมิลลิตร</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Show the title only if there are softeners */}
        {softeners.length > 0 && (
          <Typography variant="h6" component="h2" gutterBottom>
            รายการน้ำยาปรับผ้านุ่ม
          </Typography>
        )}

        {/* List of Softeners, sorted and with color highlighting for the cheapest */}
        <List>
          {sortedSofteners.map((softener, index) => (
            <ListItem
              key={index}
              sx={{
                marginBottom: 1,
                backgroundColor: calculatePricePerMl(softener) === cheapestPrice
                  ? '#d1f7d1' // Green for the cheapest
                  : calculatePricePerMl(softener) === secondCheapestPrice
                  ? '#fff3cd' // Yellow for the second-cheapest
                  : '#f9f9f9', // Default background color
                borderRadius: 1,
                display: 'flex', // Flexbox layout to prevent overlap
                justifyContent: 'space-between', // Space between text and actions
                alignItems: 'center', // Align items vertically in the center
              }}
            >
              {/* Left side: Softener info */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemText
                  primary={`${softener.name} - ${formatVolume(softener.volume)} - ${formatPrice(softener.price)}`}
                  secondary={`ราคาต่อมิลลิตร: ${formatPricePerMl(calculatePricePerMl(softener))}`}
                />
                {/* Display image if uploaded */}
                {softener.image && (
                  <Box sx={{ marginLeft: 2 }}>
                    <img
                      src={softener.image}
                      alt="Softener"
                      style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                      onClick={() => handleImageClick(softener.image)} // Show larger image on click
                    />
                  </Box>
                )}
              </Box>
              {/* Right side: Edit and Delete buttons */}
              <Box>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditSoftener(softener.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSoftener(softener.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Dialog for Delete Confirmation */}
        <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogContent>
            <Typography>
              คุณแน่ใจหรือไม่ว่าต้องการลบ {softenerToDelete?.name}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">ยกเลิก</Button>
            <Button onClick={handleConfirmDelete} color="secondary">ลบ</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog to show larger image */}
        <Dialog open={!!openImage} onClose={handleCloseImage}>
          <DialogTitle>ภาพขนาดใหญ่</DialogTitle>
          <DialogContent>
            {openImage && <img src={openImage} alt="Large Preview" style={{ width: '100%', height: 'auto' }} />}
          </DialogContent>
        </Dialog>

        {/* Snackbar for undo option */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000} // Duration to show the snackbar
          onClose={handleSnackbarClose}
          message="ลบแล้ว! กด 'Undo' เพื่อยกเลิกการลบ"
          action={
            <>
              <Button color="secondary" size="small" onClick={handleUndoRemove}>
                Undo
              </Button>
              <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                <CloseIcon />
              </IconButton>
            </>
          }
        />
      </Box>
    </Container>
  );
}

export default App;
