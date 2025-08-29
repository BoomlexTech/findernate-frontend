import React, { useRef, useState } from 'react';

type DocumentKey =
  | 'businessRegistration'
  | 'companyPan'
  | 'taxCertificate'
  | 'representativeId'
  | 'representativeAddress'
  | 'businessAddress';

export interface BusinessVerificationPayload {
  businessRegistration?: File;
  companyPan?: File;
  taxCertificate?: File;
  representativeId?: File;
  representativeAddress?: File;
  businessAddress?: File;
}

interface BusinessVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: BusinessVerificationPayload) => void;
}

const LABELS: Record<DocumentKey, string> = {
  businessRegistration: 'Upload Business Registration Certificate',
  companyPan: 'Upload Company PAN Certificate',
  taxCertificate: 'Upload TIN Number or GST Certificate',
  representativeId: "Upload Authorized Representative's ID Proof",
  representativeAddress: "Upload Authorized Representative's Address Proof",
  businessAddress: 'Upload Business Address Proof'
};

const BusinessVerificationModal: React.FC<BusinessVerificationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [files, setFiles] = useState<BusinessVerificationPayload>({});
  const inputRefs = useRef<Record<DocumentKey, HTMLInputElement | null>>({
    businessRegistration: null,
    companyPan: null,
    taxCertificate: null,
    representativeId: null,
    representativeAddress: null,
    businessAddress: null
  });

  if (!isOpen) return null;

  const triggerFile = (key: DocumentKey) => inputRefs.current[key]?.click();

  const handleFileChange = (key: DocumentKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleUpload = () => {
    onSubmit(files);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} aria-label="Close" className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-black text-lg font-semibold">Upload KYC</h2>
        </div>

        <div className="space-y-3">
          {(Object.keys(LABELS) as DocumentKey[]).map(key => (
            <div key={key} className="border rounded-xl px-3 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                </svg>
                <span className="text-sm text-gray-800">{LABELS[key]}</span>
              </div>
              <div className="flex items-center gap-2">
                {files[key] && <span className="text-xs text-gray-600 truncate max-w-[120px]">{files[key]?.name}</span>}
                <button
                  onClick={() => triggerFile(key)}
                  className="px-3 py-1.5 text-xs text-black bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {files[key] ? 'Change' : 'Upload'}
                </button>
                <input
                  ref={(el) => { inputRefs.current[key] = el; }}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(key, e)}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleUpload}
          className="mt-5 w-full py-2.5 rounded-lg bg-button-gradient text-white font-medium"
        >
          Upload
        </button>

        <p className="mt-3 text-[11px] text-gray-500 text-center">
          Please review all your uploaded documents before submitting.
        </p>
      </div>
    </div>
  );
};

export default BusinessVerificationModal;


