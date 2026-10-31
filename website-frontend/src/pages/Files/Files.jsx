import React, { useState, useEffect } from 'react';
import SEO from '../../components/Common/SEO';
import Breadcrumbs from '../../components/Common/Breadcrumbs';
import { fileService } from '../../services/fileService';
import { FileText, Download } from 'lucide-react';

const defaultDemoFiles = [
  {
    id: 'FILE-001',
    title: 'Swarnamayi Corporate Portfolio & Services 2026',
    category: 'Corporate Profile',
    description: 'Complete overview of Swarnamayi Real Estate Marketing, verified project portfolios, property advisory protocols, and client track record across Kolkata.',
    fileSize: 'PDF • 4.2 MB',
    filePath: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf'
  }
];

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fileService.getFiles();
      const fetched = res.data || [];
      setFiles(fetched.length > 0 ? fetched : defaultDemoFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles(defaultDemoFiles);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Download Property Brochures & Guides | Swarnamayi Real Estate"
        description="Download official corporate brochures, floor plans, price lists, and Kolkata real estate investment guides from Swarnamayi Real Estate Marketing."
      />

      <div className="bg-light-bg min-h-screen pb-16">
        <div className="bg-navy-900 text-white py-10 border-b border-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Resources & Files' }]} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Download Resources & Brochures</h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
              Access official Swarnamayi corporate profiles, New Town & Rajarhat investment guides, and project floor plans.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          {loading ? (
            <div className="py-20 text-center text-navy-900 font-bold">Loading downloadable resources...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file, idx) => (
                <div key={file.id || file._id || idx} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-navy transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-navy-900 bg-gray-100 px-2 py-0.5 rounded uppercase">
                          {file.category}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">{file.fileSize || 'PDF Document'}</div>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-navy-900 mb-2">{file.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-6">{file.description}</p>
                  </div>

                  <a
                    href={file.filePath}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-gold-400" />
                    <span>DOWNLOAD FILE</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
