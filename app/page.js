'use client';
import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const categories = ["Dairy", "Vegetables", "Fruits", "Meat", "Grains", "Others"];

const recipes = [
  {
    name: "Pasta",
    ingredients: ["pasta", "tomato sauce", "cheese"],
    category: "Lunch"
  },
  {
    name: "Salad",
    ingredients: ["lettuce", "tomato", "cucumber", "olive oil"],
    category: "Dinner"
  },
  {
    name: "Omelette",
    ingredients: ["eggs", "milk", "cheese"],
    category: "Breakfast"
  }
];

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', category: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [recipeSuggestions, setRecipeSuggestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const storage = getStorage();

  // Add item to database
  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name && newItem.quantity && newItem.category) {
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        category: newItem.category
      });
      setNewItem({ name: '', quantity: '', category: '' });
    }
  };

  // Read items from database
  useEffect(() => {
    const q = collection(db, 'items');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsArr = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);
    });

    return () => unsubscribe();
  }, []);

  // Delete item from database
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (image) {
      try {
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);

        // Add image 
        await addDoc(collection(db, 'classifiedImages'), {
          imageUrl,
          description: "Uploaded image"
        });

      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  // Suggest recipes 
  const suggestRecipes = () => {
    const availableItems = items.map(item => item.name.toLowerCase());
    const suggestions = recipes.filter(recipe =>
      recipe.ingredients.every(ingredient => availableItems.includes(ingredient))
    );
    setRecipeSuggestions(suggestions);
  };

  // Filter items 
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === '' || item.category === selectedCategory)
  );

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-4'>
      <div className='w-full max-w-md items-center justify-center font-mono text-sm'>
        <h1 className='text-4xl p-4 text-center'>Pantry Tracker</h1>
        <div className='bg-slate-800 p-4 rounded-lg'>
          <form className='grid grid-cols-6 items-center text-black mb-4'>
            <input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className='col-span-2 p-3 border'
              type='text'
              placeholder='Enter Item'
            />
            <input
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
              className='col-span-2 p-3 border mx-3'
              type='number'
              placeholder='Enter Qty'
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className='col-span-2 p-3 border'
            >
              <option value=''>Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={addItem}
              className='text-white bg-slate-900 hover:bg-slate-700 p-3 text-xl col-span-1'
              type='submit'
            >
              +
            </button>
          </form>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='p-3 mb-4 border w-full'
            type='text'
            placeholder='Search Items'
          />
          <div className='mb-4'>
            <label className='text-white mb-2 block'>Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='p-3 border w-full'
            >
              <option value=''>All</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <ul>
            {filteredItems.length === 0 ? (
              <li className='text-white mb-2'>No items found</li>
            ) : (
              filteredItems.map((item, id) => (
                <li
                  key={id}
                  className='my-4 w-full flex justify-between bg-slate-700'
                >
                  <div className='p-4 w-full flex justify-between text-white'>
                    <span className='capitalize'>{item.name}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>Category: {item.category}</span>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className='ml-8 p-4 border-l-2 border-slate-600 hover:bg-slate-600 w-16 text-white'
                  >
                    X
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className='mt-4'>
            <h2 className='text-white mb-2'>Capture Image</h2>
            <input
              type='file'
              accept='image/*'
              capture='camera'
              onChange={handleImageChange}
              className='p-2 text-white bg-slate-600 rounded'
            />
            {imagePreview && (
              <>
                <img src={imagePreview} alt='Preview' style={{ maxWidth: '100%' }} />
                <button
                  onClick={handleUpload}
                  className='text-white bg-slate-900 hover:bg-slate-700 p-3 mt-2'
                >
                  Upload
                </button>
              </>
            )}
          </div>
          <div className='mt-4'>
            <h2 className='text-white mb-2'>Recipe Suggestions</h2>
            <button
              onClick={suggestRecipes}
              className='text-white bg-slate-900 hover:bg-slate-700 p-3 mb-4'
            >
              Suggest Recipes
            </button>
            <ul>
              {recipeSuggestions.length === 0 ? (
                <li className='text-white mb-2'>No matching recipes found</li>
              ) : (
                recipeSuggestions.map((recipe, index) => (
                  <li key={index} className='text-white mb-2'>
                    {recipe.name} - {recipe.category}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
