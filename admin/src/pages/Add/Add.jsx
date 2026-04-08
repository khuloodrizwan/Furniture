import React, { useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = ({ url }) => {

    const [image, setImage] = useState(false);
    const [extraImages, setExtraImages] = useState([]);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Living Room",
        isDealActive: false,
        discountType: "percentage",
        discountValue: "",
    });

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Main image not selected');
            return;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", Number(data.price));
        formData.append("category", data.category);
        formData.append("image", image);
        formData.append("isDealActive", data.isDealActive);
        formData.append("discountType", data.discountType);
        formData.append("discountValue", Number(data.discountValue) || 0);
        extraImages.forEach((img) => {
            formData.append("images", img);
        });

        const response = await axios.post(`${url}/api/fur/add`, formData);
        if (response.data.success) {
            toast.success(response.data.message);
            setData({ name: "", description: "", price: "", category: data.category, isDealActive: false, discountType: "percentage", discountValue: "" });
            setImage(false);
            setExtraImages([]);
        } else {
            toast.error(response.data.message);
        }
    }

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    }

    const handleExtraImages = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + extraImages.length > 5) {
            toast.error("Max 5 extra images allowed");
            return;
        }
        setExtraImages(prev => [...prev, ...files]);
        e.target.value = '';
    }

    const removeExtraImage = (index) => {
        setExtraImages(prev => prev.filter((_, i) => i !== index));
    }

    const discountedPrice = () => {
        const p = Number(data.price);
        const v = Number(data.discountValue);
        if (!p || !v) return null;
        if (data.discountType === "percentage") return (p * (1 - v / 100)).toFixed(2);
        if (data.discountType === "flat") return (p - v).toFixed(2);
        return null;
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>

                {/* Main Image */}
                <div className='add-img-upload flex-col'>
                    <p>Main Image <span>*</span></p>
                    <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = ''; }} type="file" accept="image/*" id="image" hidden />
                    <label htmlFor="image" className='main-img-label'>
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                        {!image && <span className='upload-hint'>Click to upload</span>}
                    </label>
                </div>

                {/* Extra Images */}
                <div className='add-extra-images flex-col'>
                    <p>Extra Images <span className='optional'>(up to 5)</span></p>
                    <div className='extra-images-grid'>
                        {extraImages.map((img, index) => (
                            <div key={index} className='extra-img-wrapper'>
                                <img src={URL.createObjectURL(img)} alt={`extra-${index}`} />
                                <button type='button' className='remove-img-btn' onClick={() => removeExtraImage(index)}>✕</button>
                            </div>
                        ))}
                        {extraImages.length < 5 && (
                            <>
                                <input onChange={handleExtraImages} type="file" accept="image/*" id="extra-images" hidden multiple />
                                <label htmlFor="extra-images" className='extra-img-add-btn'>
                                    <span>+</span>
                                    <p>Add</p>
                                </label>
                            </>
                        )}
                    </div>
                </div>

                {/* Name */}
                <div className='add-product-name flex-col'>
                    <p>Furniture Name</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='e.g. Scandinavian Velvet Sofa' required />
                </div>

                {/* Description */}
                <div className='add-product-description flex-col'>
                    <p>Furniture Description</p>
                    <textarea name='description' onChange={onChangeHandler} value={data.description} rows={6} placeholder='Write content here' required />
                </div>

                {/* Category + Price */}
                <div className='add-category-price'>
                    <div className='add-category flex-col'>
                        <p>Category</p>
                        <select name='category' onChange={onChangeHandler} value={data.category}>
                            <option value="Living Room">Living Room</option>
                            <option value="Bedroom">Bedroom</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Seating">Seating</option>
                            <option value="Storage">Storage</option>
                            <option value="Study Room">Study Room</option>
                            <option value="Office">Office</option>
                            <option value="Appliances">Appliances</option>
                        </select>
                    </div>
                    <div className='add-price flex-col'>
                        <p>Price / month (₹)</p>
                        <input type="number" name='price' onChange={onChangeHandler} value={data.price} placeholder='e.g. 499' required />
                    </div>
                </div>

                {/* Deal / Discount */}
                <div className='add-deal-section flex-col'>
                    <p>Deal / Discount</p>
                    <div className='deal-toggle-row'>
                        <label className='deal-toggle-label'>
                            <input
                                type='checkbox'
                                checked={data.isDealActive}
                                onChange={(e) => setData(d => ({ ...d, isDealActive: e.target.checked }))}
                            />
                            Enable Deal
                        </label>
                    </div>

                    {data.isDealActive && (
                        <div className='deal-fields'>
                            <div className='flex-col'>
                                <p>Discount Type</p>
                                <select name='discountType' onChange={onChangeHandler} value={data.discountType}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat">Flat (₹)</option>
                                </select>
                            </div>
                            <div className='flex-col'>
                                <p>Discount Value</p>
                                <input
                                    type='number'
                                    name='discountValue'
                                    onChange={onChangeHandler}
                                    value={data.discountValue}
                                    placeholder={data.discountType === "percentage" ? "e.g. 20" : "e.g. 100"}
                                    min={0}
                                />
                            </div>
                            {discountedPrice() && (
                                <div className='deal-preview'>
                                    <span>Preview:</span>
                                    <span className='deal-original'>₹{data.price}</span>
                                    <span className='deal-final'>₹{discountedPrice()}/mo</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button type='submit' className='add-btn'>ADD FURNITURE</button>
            </form>
        </div>
    )
}

export default Add;