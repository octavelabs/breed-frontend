import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { useState } from "react";


const MyProfile = () => {
      const [formData, setFormData] = useState({
    firstName: "Amber",
    lastName: "James",
    email: "abjames@gmail.com",
    phoneCountryCode: "+234",
    phoneNumber: "8065223378",
    location: "Nigeria"
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    setIsEditing(false);
  };
    return (
        <>
            <h2 className="text-[24px] font-bold mb-8">Profile</h2>
            
           <div className="w-[40%]">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center mb-2">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 20C24.1421 20 27.5 16.6421 27.5 12.5C27.5 8.35786 24.1421 5 20 5C15.8579 5 12.5 8.35786 12.5 12.5C12.5 16.6421 15.8579 20 20 20Z" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M33.75 35C33.75 28.7868 27.7132 23.75 20 23.75C12.2868 23.75 6.25 28.7868 6.25 35" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {!isEditing && <p className="text-lg font-medium">{formData.firstName} {formData.lastName}</p>}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      variant={isEditing ? "outlined" : 'primary'}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      variant={isEditing ? "outlined" : 'primary'}
                    />
                  </div>
                </>
              ) : null}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  isDisabled={!isEditing}
                  variant={isEditing ? "outlined" : 'primary'}
                />
              </div>
              <div>
                        <label htmlFor="phone" className="block text-sm font-medium  mb-2">
                          Phone no
                        </label>
                        <div className="flex gap-2">
                        <div className="w-[20%]">
                          <Input
                            variant={isEditing ? "outlined" : 'primary'}
                            type="tel"
                            id="phone"
                            onChange={() => console.log("firstname")}
                            placeholder="Enter Phone no"
                            isDisabled={!isEditing}
                            value={formData.phoneCountryCode}
                          />
                          </div>
                          <div className="w-[80%]">
                          <Input
                            variant={isEditing ? "outlined" : 'primary'}
                            type="tel"
                            id="phone"
                            onChange={() => console.log("firstname")}
                            placeholder="Enter Phone no"
                            isDisabled={isEditing}
                             value={formData.phoneNumber}
                          />
                          </div>
                        </div>
                      </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <Input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                    isDisabled={!isEditing}
                    variant={isEditing ? "outlined" : 'primary'}
                  />
                  {!isEditing && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="#60666B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                {isEditing ? (
                  <Button
                    onClick={handleSaveChanges}
                    customClass="w-full h-[58px] text-white"
                  >
                    Save Changes
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    customClass="w-full py-3 text-white h-[58px]"
                  >
                    <svg className="mr-2" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.1667 2.5C14.3856 2.28113 14.6454 2.10752 14.9314 1.98906C15.2175 1.87061 15.5238 1.80976 15.8334 1.80976C16.1429 1.80976 16.4493 1.87061 16.7353 1.98906C17.0214 2.10752 17.2812 2.28113 17.5 2.5C17.7189 2.71887 17.8925 2.97871 18.011 3.26474C18.1294 3.55077 18.1903 3.85714 18.1903 4.16669C18.1903 4.47624 18.1294 4.78261 18.011 5.06864C17.8925 5.35467 17.7189 5.61451 17.5 5.83335L6.25002 17.0834L1.66669 18.3334L2.91669 13.75L14.1667 2.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit
                  </Button>
                )}
              </div>
            </div>
            </div>
          </>
    )
}

export default MyProfile