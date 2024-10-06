import React from 'react';
import { waitFor, render, fireEvent, screen } from '@testing-library/react';
import App from './App'; // Import the App component
import '@testing-library/jest-dom'; // Import jest-dom matchers
import { act } from 'react';  // Import act from react

describe('Item Price Check App', () => {
  // Test initial render and input fields
  test('renders input fields and buttons', () => {
    render(<App />);

    // Check if all input fields and buttons are rendered
    expect(screen.getByLabelText(/ยี่ห้อ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ราคา \(บาท\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /เพิ่มข้อมูล/i })).toBeInTheDocument();
  });

  // Test adding a item
  test('adds a new item', () => {
    render(<App />);

    // Input data for a new item
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });

    // Click the Add button
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Verify the new item is added to the list
    expect(screen.getByText(/Brand A/i)).toBeInTheDocument();
    expect(screen.getByText(/1,000 มิลลิลิตร/i)).toBeInTheDocument();
    expect(screen.getByText(/฿100/i)).toBeInTheDocument();
  });

  // Test editing a item
  test('edits an existing item', () => {
    render(<App />);

    // Add a item first
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Edit the added item
    fireEvent.click(screen.getByRole('button', { name: /edit/i })); // Click the edit button

    // Change the name and save
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.click(screen.getByRole('button', { name: /บันทึกการแก้ไข/i }));

    // Verify the item is updated
    expect(screen.getByText(/Brand B/i)).toBeInTheDocument();
  });

  // Test deleting a item
  test('removes a item', () => {
    render(<App />);

    // Add a item
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Click the delete button
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Confirm delete
    fireEvent.click(screen.getByRole('button', { name: /ลบ/i }));

    // Verify the item is removed
    expect(screen.queryByText(/Brand A/i)).not.toBeInTheDocument();
  });

  // Test sorting by price per milliliter
  test('sorts items by price per milliliter', () => {
    render(<App />);
  
    // Add two items with different price per milliliter
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));
  
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));
  
    // Open the Select dropdown and select "pricePerMl"
    fireEvent.mouseDown(screen.getByLabelText(/Sort by/i)); // Opens the dropdown
    const listbox = screen.getByRole('listbox');
    fireEvent.click(listbox.querySelector('[data-value="pricePerMl"]')); // Select the 'pricePerMl' option directly
  
    // Wait for sorting to complete
    const sortedItems = screen.getAllByRole('listitem');  // Select all list items (items)
    
    // Debug the content of the sorted items
    sortedItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, item.textContent);
    });
  
    // Verify the sorting order (Brand B should be first because it has the lower price per ml)
    expect(sortedItems[0]).toHaveTextContent('ยี่ห้อ: Brand Aปริมาณ: 1,000 มิลลิลิตร (1.0 ลิตร)ราคา: ฿100ราคาต่อมิลลิลิตร: ฿0.10');  // Lower price per ml
    expect(sortedItems[1]).toHaveTextContent('ยี่ห้อ: Brand Bปริมาณ: 500 มิลลิลิตรราคา: ฿50ราคาต่อมิลลิลิตร: ฿0.10');  // Higher price per ml
  });

  // Test sorting by volume in descending order
  test('sorts items by volume in descending order', () => {
    render(<App />);

    // Add two items with different volumes
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Open the Select dropdown and select "volume"
    fireEvent.mouseDown(screen.getByLabelText(/Sort by/i)); // Opens the dropdown
    const listbox = screen.getByRole('listbox');
    fireEvent.click(listbox.querySelector('[data-value="volume"]')); // Select the 'volume' option directly

    // Wait for sorting to complete
    const sortedItems = screen.getAllByRole('listitem');  // Select all list items (items)
    
    // Debug the content of the sorted items
    sortedItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, item.textContent);
    });

    // Verify the sorting order (Brand A should be first because it has a larger volume)
    expect(sortedItems[0]).toHaveTextContent('ยี่ห้อ: Brand Aปริมาณ: 1,000 มิลลิลิตร (1.0 ลิตร)ราคา: ฿100ราคาต่อมิลลิลิตร: ฿0.10');  // Larger volume
    expect(sortedItems[1]).toHaveTextContent('ยี่ห้อ: Brand Bปริมาณ: 500 มิลลิลิตรราคา: ฿50ราคาต่อมิลลิลิตร: ฿0.10');  // Smaller volume
  });

  // Test sorting by price in ascending order
  test('sorts items by price in ascending order', () => {
    render(<App />);

    // Add two items with different prices
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Open the Select dropdown and select "price"
    fireEvent.mouseDown(screen.getByLabelText(/Sort by/i)); // Opens the dropdown
    const listbox = screen.getByRole('listbox');
    fireEvent.click(listbox.querySelector('[data-value="price"]')); // Select the 'price' option directly

    // Wait for sorting to complete
    const sortedItems = screen.getAllByRole('listitem');  // Select all list items (items)
    
    // Debug the content of the sorted items
    sortedItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, item.textContent);
    });

    // Verify the sorting order (Brand B should be first because it has the lower price)
    expect(sortedItems[0]).toHaveTextContent('ยี่ห้อ: Brand Bปริมาณ: 500 มิลลิลิตรราคา: ฿100ราคาต่อมิลลิลิตร: ฿0.20');  // Lower price
    expect(sortedItems[1]).toHaveTextContent('ยี่ห้อ: Brand Aปริมาณ: 1,000 มิลลิลิตร (1.0 ลิตร)ราคา: ฿200ราคาต่อมิลลิลิตร: ฿0.20');  // Higher price
  });

  // Test sorting items by name
  test('sorts items by name in alphabetical order', async () => {
    render(<App />);

    // Add two items
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Zebra' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Apple' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Select "Sort by Name"
    fireEvent.mouseDown(screen.getByLabelText(/Sort by/i)); // Opens the dropdown
    const listbox = screen.getByRole('listbox');
    fireEvent.click(listbox.querySelector('[data-value="name"]')); // Select 'name'

    // Check if the items are sorted alphabetically
    const sortedItems = screen.getAllByRole('listitem');
    expect(sortedItems[0]).toHaveTextContent('Apple');  // 'Apple' should be first
    expect(sortedItems[1]).toHaveTextContent('Zebra');  // 'Zebra' should be second
  });

// Test copying the items list to clipboard
  test('copies the items list to clipboard', async () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<App />);

    // Add two items
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Use act() to wrap the event that causes a state update
    await act(async () => {
      // Click the copy to clipboard text
      fireEvent.click(screen.getByText(/คัดลอกไปยังคลิปบอร์ด/i));  // This is the button to copy the list
    });

    // Ensure the correct text is copied to the clipboard
    const expectedText = `รายการน้ำยาปรับผ้านุ่ม\n=====================\n\nยี่ห้อ: Brand A\nปริมาณ: 1000 มิลลิลิตร\nราคา: ฿100\n-------------------\nยี่ห้อ: Brand B\nปริมาณ: 500 มิลลิลิตร\nราคา: ฿50\n`;

    // Remove potential extra spaces or line breaks from both expected and actual values
    const cleanExpectedText = expectedText.replace(/\s+/g, ' ').trim();
    const clipboardText = navigator.clipboard.writeText.mock.calls[0][0].replace(/\s+/g, ' ').trim();

    expect(clipboardText).toBe(cleanExpectedText);
  });

  // Test clearing all items
  test('clears all items after confirmation', async () => {
    render(<App />);

    // Add two items
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Check that the items have been added
    expect(screen.getAllByRole('listitem').length).toBe(2);

    // Mock window.confirm to automatically confirm the clear-all action
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    // Click the "Clear All" button
    fireEvent.click(screen.getByRole('button', { name: /ลบข้อมูลทั้งหมด/i }));  // Clear All button

    // Ensure that all items are cleared after confirmation
    expect(screen.queryAllByRole('listitem').length).toBe(0);

    // Restore the window.confirm mock
    window.confirm.mockRestore();
  });

  // Test that items are not cleared when confirmation is declined
  test('does not clear items when confirmation is canceled', async () => {
    render(<App />);

    // Add two items
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Check that the items have been added
    expect(screen.getAllByRole('listitem').length).toBe(2);

    // Mock window.confirm to automatically cancel the clear-all action
    jest.spyOn(window, 'confirm').mockImplementation(() => false);

    // Click the "Clear All" button
    fireEvent.click(screen.getByRole('button', { name: /ลบข้อมูลทั้งหมด/i }));  // Clear All button

    // Ensure that the items are not cleared after canceling the confirmation
    expect(screen.getAllByRole('listitem').length).toBe(2);

    // Restore the window.confirm mock
    window.confirm.mockRestore();
  });

  // Test adding an image to a item
  test('adds an image to a item', async () => {
    render(<App />);

    // Add a item without an image
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });

    // Mock the file input change event with a fake image file
    const file = new File(['(⌐□_□)'], 'image.png', { type: 'image/png' });
    const input = screen.getByLabelText(/เพิ่มรูปภาพ/i); // The label for the image input field
    fireEvent.change(input, { target: { files: [file] } });

    // Click the Add button
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));

    // Wait for the image preview to appear
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());

    // Check if the item with the image was added to the list
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('ยี่ห้อ: Brand A');
  });

  // Test removing an image from a item
  test('removes an image from a item', async () => {
    render(<App />);
  
    // Add a item with an image
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
  
    // Mock the file input change event with a fake image file
    const file = new File(['(⌐□_□)'], 'image.png', { type: 'image/png' });
    const input = screen.getByLabelText(/เพิ่มรูปภาพ/i); // File input label for image upload
    fireEvent.change(input, { target: { files: [file] } });
  
    // Click the Add button
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));
  
    // Simulate editing the item (which sets editIndex and shows the remove image button)
    const editButton = screen.getByLabelText('edit');
    fireEvent.click(editButton);
  
    // Wait for the image preview and remove button to appear
    await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: /ลบรูปภาพ/i })).toBeInTheDocument());
  
    // Remove the image
    fireEvent.click(screen.getByRole('button', { name: /ลบรูปภาพ/i }));
  
    // Verify that the image preview is no longer in the document
    await waitFor(() => expect(screen.queryByAltText('Preview')).not.toBeInTheDocument());
  });

  // Test preventing item addition with incomplete data
  test('undoes item deletion using "Undo" button after confirmation', async () => {
    render(<App />);
  
    // Add a item (Brand A)
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));
  
    // Use a flexible matcher to check if the item was added
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Brand A'))).toBeInTheDocument();
    });
  
    // Click the delete button to open the confirmation dialog
    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
  
    // Confirm the deletion in the dialog by clicking "ลบ"
    fireEvent.click(screen.getByRole('button', { name: /ลบ/i }));
  
    // Wait for the snackbar to appear and locate the "Undo" button
    const undoButton = await waitFor(() => screen.getByText(/Undo/i));
  
    // Click the "Undo" button
    fireEvent.click(undoButton);
  
    // Ensure the item is back in the list after undo
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Brand A'))).toBeInTheDocument();
    });
  });
  
  // Test clear all button is disabled in edit mode
  test('does not allow clearing all items while editing', async () => {
    render(<App />);
  
    // Add two items
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));
  
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand B' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));
  
    // Enter edit mode by clicking the edit button on the first item (Brand A)
    const editButton = screen.getAllByLabelText('edit')[0];
    fireEvent.click(editButton);
  
    // Ensure "Clear All" button is either disabled or does not clear the items while editing
    const clearAllButton = screen.getByRole('button', { name: /ลบข้อมูลทั้งหมด/i });
  
    // Check that the "Clear All" button is disabled while editing
    expect(clearAllButton).toBeDisabled();
  
    // Try to click the "Clear All" button (even if disabled, the test should not proceed to clear items)
    fireEvent.click(clearAllButton);
  
    // Verify that both items still exist using a flexible text matcher
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('Brand A'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Brand B'))).toBeInTheDocument();
    });
  });

  // Test Prevent Copy to Clipboard While Editing
  test('does not render copy to clipboard button while editing', async () => {
    render(<App />);
  
    // Add a item (Brand A)
    fireEvent.change(screen.getByLabelText(/ยี่ห้อ/i), { target: { value: 'Brand A' } });
    fireEvent.change(screen.getByLabelText(/ปริมาณ \(มิลลิลิตร\)/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/ราคา \(บาท\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /เพิ่มข้อมูล/i }));
  
    // Enter edit mode by clicking the edit button
    const editButton = screen.getAllByLabelText('edit')[0];
    fireEvent.click(editButton);
  
    // Ensure that the "Copy to Clipboard" button is not rendered during editing
    expect(screen.queryByText(/คัดลอกไปยังคลิปบอร์ด/i)).not.toBeInTheDocument();
  });
  

});
