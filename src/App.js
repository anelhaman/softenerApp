import React, { useState } from 'react';
import { TextField, Button, Container, List, ListItem, ListItemText, Typography, Box, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function App() {
  const [name, setName] = useState('');
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);  // State to store the image as Base64
  const [softeners, setSofteners] = useState([]);
  const [openImage, setOpenImage] = useState(null); // State to control image modal

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

  // Add a new softener
  const handleAddSoftener = () => {
    if (!name || !volume || !price) {
      alert('กรุณากรอกข้อมูล ยี่ห้อ ปริมาณ และ ราคา ให้ครบถ้วน');
      return;
    }

    const newSoftener = { name, volume: parseFloat(volume), price: parseFloat(price), image };  // Add image to softener
    setSofteners([...softeners, newSoftener]);
    setName('');
    setVolume('');
    setPrice('');
    setImage(null);  // Clear image input after adding
  };

  // Clear all softeners with confirmation
  const handleClearAll = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?')) {
      setSofteners([]); // Set the softeners array to an empty array
    }
  };

  // Remove a specific softener by index with confirmation
  const handleRemoveSoftener = (indexToRemove) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) {
      setSofteners(softeners.filter((_, index) => index !== indexToRemove));
    }
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
  const sortedSofteners = softeners.slice().sort((a, b) => calculatePricePerMl(a) - calculatePricePerMl(b));

  // Get the cheapest softener's price per milliliter
  const cheapestPricePerMl = sortedSofteners.length > 0 ? calculatePricePerMl(sortedSofteners[0]) : null;

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
          การเปรียบเทียบราคาน้ำยาปรับผ้านุ่ม
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
          type="tel"          // Ensures number pad on iPhone
          inputMode="numeric"  // Specifically tells the browser to use numeric input
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="ราคา (บาท)"
          variant="outlined"
          fullWidth
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="tel"          // Ensures number pad on iPhone
          inputMode="numeric"  // Specifically tells the browser to use numeric input
          sx={{ marginBottom: 2 }}
        />

        {/* File Input for Image */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          เพิ่มรูปภาพ (เพิ่มได้เพียง 1 รูปภาพ)
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </Button>

        {/* Show preview of the image if selected */}
        {image && (
          <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
            <img src={image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
          </Box>
        )}

        {/* Add Softener Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleAddSoftener}
          disabled={!name || !volume || !price}  // Disable button if any field is empty
          sx={{ marginBottom: 4 }}
        >
          เพิ่มข้อมูล
        </Button>

        {/* Clear All Button */}
        {softeners.length > 0 && (
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleClearAll}
            sx={{ marginBottom: 4 }}
          >
            ลบข้อมูลทั้งหมด
          </Button>
        )}

        <Typography variant="h6" component="h2" gutterBottom>
          รายการน้ำยาปรับผ้านุ่ม
        </Typography>

        {/* List of Softeners, sorted and with color highlighting for the cheapest */}
        <List>
          {sortedSofteners.map((softener, index) => (
            <ListItem
              key={index}
              sx={{
                marginBottom: 1,
                backgroundColor: calculatePricePerMl(softener) === cheapestPricePerMl ? '#d1f7d1' : '#f9f9f9', // Highlight cheapest softener
                borderRadius: 1,
              }}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSoftener(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${softener.name} - ${formatVolume(softener.volume)} - ${formatPrice(softener.price)}`}
                secondary={`ราคาต่อมิลลิลิตร: ${formatPricePerMl(calculatePricePerMl(softener))}`}
              />
              {/* Display image if uploaded */}
              {softener.image && (
                <Box sx={{ marginLeft: 2 }}>
                  <img
                    src={softener.image}
                    alt="Softener"
                    style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                    onClick={() => handleImageClick(softener.image)}  // Show larger image on click
                  />
                </Box>
              )}
            </ListItem>
          ))}
        </List>

        {/* Dialog to show larger image */}
        <Dialog open={!!openImage} onClose={handleCloseImage}>
          <DialogTitle>ภาพขนาดใหญ่</DialogTitle>
          <DialogContent>
            {openImage && <img src={openImage} alt="Large Preview" style={{ width: '100%', height: 'auto' }} />}
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}

export default App;
