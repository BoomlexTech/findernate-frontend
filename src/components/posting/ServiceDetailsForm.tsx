import { ServiceDetailsFormProps } from '@/types';
import React, { useState } from 'react';


const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

const ServiceDetailsForm: React.FC<ServiceDetailsFormProps> = ({
  formData,
  onChange,
}) => {

    const currency=['INR', 'USD', 'EUR'];
    const niche= ['Business', 'Technology', 'Education', 'Health & Wellness']
    const type= ['in-person', 'online', 'hybrid']

    const [schedule, setSchedule] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { isClosed: false, startTime: '', endTime: '' };
      return acc;
    }, {} as Record<string, { isClosed: boolean; startTime: string; endTime: string }>)
  );

  const handleScheduleChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const toggleClosed = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isClosed: !prev[day].isClosed,
      },
    }));
  };

  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow mb-6 border-2 border-yellow-500">
      <h3 className="text-lg text-black font-bold mb-4">Service Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Plumbing, Tutoring"
            value={formData.service.name}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
          <input
            type="number"
            name="price"
            min="0"
            value={formData.service.price}
            onChange={onChange}
            className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="description"
            placeholder="Service Description..."
            value={formData.service.description}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
            />
        <select
          name="currency"
          value={formData.service.currency}
          onChange={onChange}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500
            ${formData.service.currency === '' ? 'text-gray-500' : 'text-gray-900'}`}
          required
        >
          <option value="" disabled>Select currency</option>
          {currency.map((curr) => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
         <div className='mb-4'>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Link</label>
          <input
            type="text"
            name="link"
            value={formData.service.link}
            onChange={onChange}
            className="w-full p-3 border text-gray-900 border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1"></label>
        <select
          name="subcategory"
          value={formData.service.subcategory}
          onChange={onChange}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500
            ${formData.service.subcategory === '' ? 'text-gray-500' : 'text-gray-900'}`}
          required
        >
          {niche.map((niche) => (
            <option key={niche} value={niche}>{niche}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          name="duration"
          placeholder="Duration"
          value={formData.service.duration}
          onChange={onChange}
          className="w-full p-3 text-black border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <select
          name="currency"
          value={formData.service.serviceType}
          onChange={onChange}
          className={`w-full p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500
            ${formData.service.serviceType === '' ? 'text-gray-500' : 'text-gray-900'}`}
          required
        >
          {type.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>



        <div className="mt-8">
        <h3 className="text-lg font-semibold text-black mb-4">Schedule</h3>
        <div className="border border-gray-300 rounded-lg p-4 space-y-4">
          {daysOfWeek.map(day => (
            <div key={day} className="border border-yellow-300 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-md text-black font-semibold">{day}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{schedule[day].isClosed ? 'Closed' : 'Open'}</span>
                  <button
                    onClick={() => toggleClosed(day)}
                    className={`w-10 h-5 rounded-full transition-colors duration-300 ${
                      schedule[day].isClosed ? 'bg-gray-400' : 'bg-yellow-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
                        schedule[day].isClosed ? 'translate-x-0' : 'translate-x-5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="startTime"
                  type="time"
                  disabled={schedule[day].isClosed}
                  value={schedule[day].startTime}
                  onChange={(e) => handleScheduleChange(day, 'startTime', e.target.value)}
                  placeholder="Start Time"
                  className="w-full p-2 border text-gray-900 border-gray-300 rounded-md focus:ring-yellow-500"
                />
                <input
                  name="endTime"
                  type="time"
                  disabled={schedule[day].isClosed}
                  value={schedule[day].endTime}
                  onChange={(e) => handleScheduleChange(day, 'endTime', e.target.value)}
                  placeholder="End Time"
                  className="w-full p-2 border text-gray-900 border-gray-300 rounded-md focus:ring-yellow-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-black mb-4">Location Detiails</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            name="address"
            placeholder="Enter address"
            value={formData.service.location.address}
            onChange={onChange}
            className="w-full p-3 border text-black border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Place/City</label>
          <input
            type="text  "
            name="city"
            placeholder='Enter city'
            value={formData.service.location.city}
            onChange={onChange}
            className="w-full p-3 border text-black border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="state"
            placeholder="Enter state"
            value={formData.service.location.state}
            onChange={onChange}
            className="w-full p-3 border text-black border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            name="country"
            placeholder='Enter country'
            value={formData.service.location.country}
            onChange={onChange}
            className="w-full p-3 border text-black border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
          <input
            type="text"
            name="requirements"
            placeholder="Enter requirements for your services"
            value={formData.service.requirements}
            onChange={onChange}
            className="w-full p-3 border text-black border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
          <input
            type="text"
            name="deliverables"
            placeholder='Enter deliverables for your services'
            value={formData.service.deliverables}
            onChange={onChange}
            className="w-full p-3 border text-black border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            required
          />
        </div>
      </div>

      </div>

    </div>


  );
};

export default ServiceDetailsForm;
