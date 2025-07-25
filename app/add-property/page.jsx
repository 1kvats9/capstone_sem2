"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const AddPropertyPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'House',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    price: '',
    bedrooms: '',
    bathrooms: '',
    sizeSqFt: '',
    amenities: [],
    images: [],
    isBiddingActive: false,
    biddingEndsAt: '',
    startingBid: ''
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      router.push('/login');
      return;
    }
    setEmail(userEmail);
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    setSelectedFiles(files);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    const uploadedImages = [];

    try {
      for (const file of selectedFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedImages.push(result.url);
        } else {
          throw new Error('Failed to upload image');
        }
      }
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload some images');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages();
      const allImages = [...formData.images, ...uploadedImageUrls];

      const response = await fetch('/api/properties/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          ...formData,
          images: allImages,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          sizeSqFt: parseInt(formData.sizeSqFt),
          startingBid: formData.startingBid ? parseFloat(formData.startingBid) : parseFloat(formData.price)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Property added successfully!");
        setSelectedFiles([]);
        router.push('/profile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add property");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="px-10 md:px-16 lg:px-28 py-4">
        <Navbar />
        
        <div className="max-w-4xl mx-auto py-10">
          <h1 className="text-3xl font-bold gradient-text mb-8 text-center">Add New Property</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 glass-effect p-8 rounded-xl border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Ranch">Ranch</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Address</label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">State</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">ZIP Code</label>
                <input
                  type="text"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Size (sq ft)</label>
                <input
                  type="number"
                  name="sizeSqFt"
                  value={formData.sizeSqFt}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Amenities</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add amenity"
                  className="flex-1 px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 glass-effect rounded-full text-sm border border-slate-600"
                  >
                    {amenity}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-red-400 transition-colors"
                      onClick={() => removeAmenity(amenity)}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-slate-300">Property Images</label>
                
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <p className="text-slate-400">Click to upload images</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 10 images</p>
                    </div>
                  </label>
                </div>

                {/* Preview selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-300 mb-2">Selected files ({selectedFiles.length}):</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display uploaded images */}
                {formData.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-300 mb-2">Uploaded images ({formData.images.length}):</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.images.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Uploaded ${index}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="isBiddingActive"
                  checked={formData.isBiddingActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="text-sm font-medium text-slate-300">Enable Bidding</label>
              </div>

              {formData.isBiddingActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Starting Bid ($)</label>
                    <input
                      type="number"
                      name="startingBid"
                      value={formData.startingBid}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Bidding Ends At</label>
                    <input
                      type="datetime-local"
                      name="biddingEndsAt"
                      value={formData.biddingEndsAt}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 glass-effect border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 glass-effect text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors border border-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 hover:shadow-lg"
              >
                {uploading ? "Uploading Images..." : loading ? "Adding..." : "Add Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyPage;