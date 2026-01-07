import React, { useState, useRef, useEffect } from "react";
import logoImage from "../../../../public/Genius-Tutor-Logo.png";
import {
  Download,
  Printer,
  User,
  Calendar,
  Briefcase,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useSendAppointmentToStudentMutation } from "@/redux/features/AppointmentLetter/AppointmentLetterApi";
import { toast } from "@/components/ui/use-toast";

interface AppointmentTerm {
  id: string;
  text: string;
}

interface AppointmentLetterData {
  tutorName: string;
  position: string;
  joiningDate: string;
  salary: string;
  tuitionTime: string;
  date: string;
  terms: AppointmentTerm[];
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  workingDays: string;
  noticePeriod: string;
}

const AppointmentLetter = () => {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [letterData, setLetterData] = useState<AppointmentLetterData>({
    tutorName: "Tawhidul Islam",
    position: "ICT Tutor",
    joiningDate: "2025-01-01",
    salary: "$2000/month",
    tuitionTime: "Monday to Friday, 4 PM - 7 PM",
    date: new Date().toISOString().split("T")[0],
    terms: [
      {
        id: "1",
        text: "The tutor will maintain professional conduct at all times.",
      },
      {
        id: "2",
        text: "All teaching materials will be provided by the institution.",
      },
      { id: "3", text: "Monthly performance reviews will be conducted." },
      {
        id: "4",
        text: "Any changes in schedule must be communicated one week in advance.",
      },
    ],
    companyName: "Genius Tutor",
    companyAddress: "123 Education Street, Dhaka 1205",
    companyPhone: "+880 1234-567890",
    companyEmail: "hr@geniustutor.edu",
    workingDays: "Monday to Friday",
    noticePeriod: "30 days",
  });

  const [newTerm, setNewTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [sendAppointmentToStudent] = useSendAppointmentToStudentMutation();

  // Convert logo to base64 URL
  useEffect(() => {
    const loadLogo = async () => {
      try {
        if (typeof logoImage === "string") {
          setLogoUrl(logoImage);
        } else if (
          logoImage &&
          typeof logoImage === "object" &&
          "src" in logoImage
        ) {
          setLogoUrl(logoImage.src);

          const response = await fetch(logoImage.src);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setLogoUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      } catch (error) {
        console.error("Error loading logo:", error);
        setLogoUrl("");
      }
    };

    loadLogo();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLetterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTerm = () => {
    if (newTerm.trim()) {
      setLetterData((prev) => ({
        ...prev,
        terms: [
          ...prev.terms,
          { id: Date.now().toString(), text: newTerm.trim() },
        ],
      }));
      setNewTerm("");
    }
  };

  const handleRemoveTerm = (id: string) => {
    setLetterData((prev) => ({
      ...prev,
      terms: prev.terms.filter((term) => term.id !== id),
    }));
  };

  const handleUpdateTerm = (id: string, newText: string) => {
    setLetterData((prev) => ({
      ...prev,
      terms: prev.terms.map((term) =>
        term.id === id ? { ...term, text: newText } : term
      ),
    }));
  };

  // Upload image to server and get URL
  const uploadImage = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-image`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      const result = await res.json();
      return result.url;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to upload file",
        variant: "destructive",
      });
      throw err;
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    setIsGeneratingPDF(true);

    try {
      const content = pdfRef.current;
      const originalStyles = {
        display: content.style.display,
        position: content.style.position,
        left: content.style.left,
        top: content.style.top,
        width: content.style.width,
        backgroundColor: content.style.backgroundColor,
        color: content.style.color,
        lineHeight: content.style.lineHeight,
        padding: content.style.padding,
      };

      content.style.display = "block";
      content.style.position = "absolute";
      content.style.left = "0px";
      content.style.top = "0px";
      content.style.width = "794px";
      content.style.backgroundColor = "#ffffff";
      content.style.color = "#000000";
      content.style.lineHeight = "1.4";
      content.style.padding = "30px";

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        onclone: (clonedDoc, element) => {
          element.style.lineHeight = "1.4";
          element.style.padding = "30px";

          const lists = element.querySelectorAll("ol, ul");
          lists.forEach((list) => {
            if (list instanceof HTMLElement) {
              list.style.marginTop = "5px";
              list.style.marginBottom = "5px";
            }
          });

          const paragraphs = element.querySelectorAll("p");
          paragraphs.forEach((p) => {
            if (p instanceof HTMLElement) {
              p.style.marginTop = "5px";
              p.style.marginBottom = "5px";
            }
          });

          const signatureDivs = element.querySelectorAll(
            'div[style*="margin-top"]'
          );
          signatureDivs.forEach((div) => {
            if (div instanceof HTMLElement && div.style.marginTop) {
              const currentMargin = parseInt(div.style.marginTop);
              if (currentMargin > 20) {
                div.style.marginTop = currentMargin * 0.5 + "px";
              }
            }
          });
        },
      });

      Object.keys(originalStyles).forEach((key) => {
        content.style[key as any] =
          originalStyles[key as keyof typeof originalStyles];
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight > pageHeight) {
        const scaleFactor = (pageHeight / pdfHeight) * 0.95;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight * scaleFactor);
      } else {
        const yOffset = (pageHeight - pdfHeight) / 2;
        pdf.addImage(imgData, "PNG", 0, yOffset, pdfWidth, pdfHeight);
      }

      pdf.save(
        `Appointment_Letter_${letterData.tutorName.replace(/\s+/g, "_")}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const printLetter = () => {
    const printWindow = window.open("", "_blank", "width=900,height=600");
    if (!printWindow) {
      alert("Please allow popups for printing");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment Letter - ${letterData.tutorName}</title>
          <style>
            @media print {
              @page {
                margin: 15mm 20mm;
              }
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.4;
                color: #000;
                margin: 0;
                padding: 0;
                font-size: 12px;
              }
              .letter-container {
                max-width: 100%;
                margin: 0 auto;
                padding: 20px;
              }
              .letter-header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              .company-logo {
                max-height: 60px;
                height: auto;
                margin: 0 auto 10px;
                display: block;
              }
              h1 {
                font-size: 20px;
                font-weight: bold;
                margin: 5px 0;
              }
              .subtitle {
                color: #666;
                font-size: 12px;
                margin: 0;
              }
              .company-info {
                margin-bottom: 15px;
              }
              .company-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .recipient-section {
                margin: 15px 0;
                padding: 10px;
                background: #f5f5f5;
              }
              .section-title {
                font-size: 14px;
                font-weight: bold;
                margin: 15px 0 8px;
                padding-bottom: 4px;
                border-bottom: 1px solid #ddd;
              }
              .appointment-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 11px;
              }
              .appointment-table td {
                padding: 6px 8px;
                border: 1px solid #ddd;
              }
              .appointment-table td:first-child {
                font-weight: 600;
                width: 35%;
              }
              .terms-list {
                margin-left: 15px;
                margin-bottom: 15px;
                font-size: 11px;
                line-height: 1.3;
              }
              .terms-list li {
                margin-bottom: 5px;
              }
              .closing-section {
                margin: 15px 0;
                line-height: 1.4;
                font-size: 11px;
              }
              .signature-section {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
                border-top: 1px solid #000;
                padding-top: 15px;
                font-size: 11px;
              }
              .signature-box {
                width: 45%;
                text-align: center;
              }
              .signature-line {
                margin-top: 40px;
                border-top: 1px solid #000;
                width: 150px;
                display: inline-block;
              }
              .signature-name {
                margin-top: 5px;
                font-weight: 600;
              }
              .signature-title {
                color: #666;
                font-size: 10px;
              }
              .no-print {
                display: none !important;
              }
              * {
                margin-top: 0;
                margin-bottom: 0;
                padding-top: 0;
                padding-bottom: 0;
              }
              p {
                margin: 3px 0;
              }
              div {
                margin: 2px 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="letter-container">
            <div class="letter-header">
              ${
                logoUrl
                  ? `<img src="${logoUrl}" alt="Logo" class="company-logo" />`
                  : ""
              }
              <h1>APPOINTMENT LETTER</h1>
              <p class="subtitle">Official Appointment Confirmation</p>
            </div>

            <div class="company-info">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <div>
                  <div class="company-name">${letterData.companyName}</div>
                  <div style="font-size: 11px; color: #555;">
                    <div>${letterData.companyAddress}</div>
                    <div>${letterData.companyPhone}</div>
                    <div>${letterData.companyEmail}</div>
                  </div>
                </div>
                <div style="text-align: right; font-size: 11px;">
                  <div><strong>Date:</strong> ${formatDate(
                    letterData.date
                  )}</div>
                </div>
              </div>
            </div>

            <div class="recipient-section">
              <div><strong>To:</strong></div>
              <div style="font-size: 14px; font-weight: bold; margin-top: 3px;">
                ${letterData.tutorName}
              </div>
            </div>

            <div>
              <p><strong>Dear ${letterData.tutorName},</strong></p>
              <p>
                We are pleased to inform you that you have been selected for the position of 
                <strong> ${letterData.position}</strong> at ${
      letterData.companyName
    }. 
                This letter serves as confirmation of your appointment, effective from 
                <strong> ${formatDate(letterData.joiningDate)}</strong>.
              </p>
            </div>

            <div class="section-title">APPOINTMENT DETAILS</div>
            <table class="appointment-table">
              <tr>
                <td>Position:</td>
                <td>${letterData.position}</td>
              </tr>
              <tr>
                <td>Joining Date:</td>
                <td>${formatDate(letterData.joiningDate)}</td>
              </tr>
              <tr>
                <td>Salary:</td>
                <td>${letterData.salary}</td>
              </tr>
              <tr>
                <td>Working Hours:</td>
                <td>${letterData.tuitionTime}</td>
              </tr>
              <tr>
                <td>Working Days:</td>
                <td>${letterData.workingDays}</td>
              </tr>
             
              <tr>
                <td>Notice Period:</td>
                <td>${letterData.noticePeriod}</td>
              </tr>
            </table>

            <div class="section-title">TERMS & CONDITIONS</div>
            <ol class="terms-list">
              ${letterData.terms
                .map(
                  (term, index) => `
                <li>${term.text}</li>
              `
                )
                .join("")}
            
              <li>Working days are <strong>${
                letterData.workingDays
              }</strong>.</li>
              <li>The notice period required is <strong>${
                letterData.noticePeriod
              }</strong>.</li>
            </ol>

            <div class="closing-section">
              <p>We believe that your skills and experience will be a valuable addition to our team.</p>
              <p>Please sign and return a copy of this letter to confirm your acceptance.</p>
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <div style="font-weight: bold; margin-bottom: 10px;">
                  For ${letterData.companyName}
                </div>
                <div class="signature-line"></div>
                <div class="signature-name">Authorized Signatory</div>
                <div class="signature-title">HR Department</div>
              </div>
              <div class="signature-box">
                <div style="font-weight: bold; margin-bottom: 10px;">
                  Accepted By
                </div>
                <div class="signature-line"></div>
                <div class="signature-name">${letterData.tutorName}</div>
                <div class="signature-title">Tutor</div>
                <div style="margin-top: 5px;">Date: _______________</div>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => {
                  window.close();
                }, 500);
              }, 100);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate PDF as blob for uploading
  const generatePDFAsBlob = async (): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!pdfRef.current) throw new Error("PDF content not found");

        const content = pdfRef.current;
        const originalStyles = {
          display: content.style.display,
          position: content.style.position,
          left: content.style.left,
          top: content.style.top,
          width: content.style.width,
          backgroundColor: content.style.backgroundColor,
          color: content.style.color,
          lineHeight: content.style.lineHeight,
          padding: content.style.padding,
        };

        content.style.display = "block";
        content.style.position = "absolute";
        content.style.left = "0px";
        content.style.top = "0px";
        content.style.width = "794px";
        content.style.backgroundColor = "#ffffff";
        content.style.color = "#000000";
        content.style.lineHeight = "1.4";
        content.style.padding = "30px";

        const canvas = await html2canvas(content, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 794,
        });

        Object.keys(originalStyles).forEach((key) => {
          content.style[key as any] =
            originalStyles[key as keyof typeof originalStyles];
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        const pageHeight = pdf.internal.pageSize.getHeight();

        if (pdfHeight > pageHeight) {
          const scaleFactor = (pageHeight / pdfHeight) * 0.95;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight * scaleFactor);
        } else {
          const yOffset = (pageHeight - pdfHeight) / 2;
          pdf.addImage(imgData, "PNG", 0, yOffset, pdfWidth, pdfHeight);
        }

        // Convert PDF to blob
        const pdfBlob = pdf.output("blob");
        resolve(pdfBlob);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Convert blob to File object
  const blobToFile = (blob: Blob, fileName: string): File => {
    const file = new File([blob], fileName, { type: "application/pdf" });
    return file;
  };

  const handleSendToStudent = async () => {
    if (!senderId.trim()) {
      alert("Please enter sender ID");
      return;
    }

    setSending(true);
    try {
      // Step 1: Generate PDF as blob
      const pdfBlob = await generatePDFAsBlob();

      // Step 2: Convert blob to File object
      const pdfFile = blobToFile(
        pdfBlob,
        `Appointment_${letterData.tutorName}_${senderId}.pdf`
      );

      // Step 3: Upload PDF to image upload endpoint and get URL
      const pdfUrl = await uploadImage(pdfFile);

      // Step 4: Prepare data for backend
      const appointmentData = {
        studentId: senderId, // This will be used as senderId in backend
        pdf: pdfUrl, // The URL returned from image upload
      };


      // Step 5: Send data to backend (without file, just URL)
      const response = await sendAppointmentToStudent(appointmentData).unwrap();


      setSendSuccess(true);
      setTimeout(() => {
        setShowSendModal(false);
        setSendSuccess(false);
        setSenderId("");
      }, 2000);

      toast({
        title: "Success",
        description: "Appointment letter sent and saved successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error sending appointment:", error);

      if (error?.data?.message) {
        toast({
          title: "Error",
          description: error.data.message,
          variant: "destructive",
        });
      } else if (error?.message) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send appointment letter. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Appointment Letter Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Create professional appointment letters for tutors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Letter Details
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-indigo-600 hover:text-indigo-700"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {isEditing ? "Preview" : "Edit"}
                </button>
              </div>

              <div className="space-y-4">
                {/* Tutor Name */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Tutor Name
                  </label>
                  <input
                    type="text"
                    name="tutorName"
                    value={letterData.tutorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter tutor's name"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={letterData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Mathematics Tutor"
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joining Date
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={letterData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={letterData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., $25/hour"
                  />
                </div>

                {/* Tuition Time */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    Tuition Time
                  </label>
                  <input
                    type="text"
                    name="tuitionTime"
                    value={letterData.tuitionTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Monday to Friday, 4 PM - 7 PM"
                  />
                </div>

                {/* Working Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Days
                  </label>
                  <input
                    type="text"
                    name="workingDays"
                    value={letterData.workingDays}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Monday to Friday"
                  />
                </div>

            

                {/* Notice Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Period
                  </label>
                  <input
                    type="text"
                    name="noticePeriod"
                    value={letterData.noticePeriod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 30 days"
                  />
                </div>

                {/* Company Details */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Company Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={letterData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Address
                      </label>
                      <textarea
                        name="companyAddress"
                        value={letterData.companyAddress}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="companyPhone"
                          value={letterData.companyPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="companyEmail"
                          value={letterData.companyEmail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Terms & Conditions
                  </h3>

                  <div className="space-y-2 mb-4">
                    {letterData.terms.map((term) => (
                      <div key={term.id} className="flex items-start group">
                        <div className="flex-1 bg-gray-50 px-4 py-2 rounded-lg">
                          {isEditing ? (
                            <input
                              type="text"
                              value={term.text}
                              onChange={(e) =>
                                handleUpdateTerm(term.id, e.target.value)
                              }
                              className="w-full bg-transparent border-none focus:outline-none"
                            />
                          ) : (
                            <span className="text-gray-700">{term.text}</span>
                          )}
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveTerm(term.id)}
                            className="ml-2 p-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        placeholder="Add new term..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === "Enter" && handleAddTerm()}
                      />
                      <button
                        onClick={handleAddTerm}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={printLetter}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Printer className="h-5 w-5 mr-2" />
                      Print
                    </button>
                  </div>

                  <button
                    onClick={() => setShowSendModal(true)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send to Student
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Letter Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4" style={{ lineHeight: "1.4" }}>
                {/* Letter Header */}
                <div className="text-center border-b pb-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Genius Tutor Logo"
                        className="h-14 w-auto"
                      />
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    APPOINTMENT LETTER
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Official Appointment Confirmation
                  </p>
                </div>

                {/* Company Details */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">
                      {letterData.companyName}
                    </h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {letterData.companyAddress}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {letterData.companyPhone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {letterData.companyEmail}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">Date:</div>
                    <div>{formatDate(letterData.date)}</div>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-700">
                    <div className="font-medium">To:</div>
                    <div className="font-semibold mt-1">
                      {letterData.tutorName}
                    </div>
                  </div>
                </div>

                {/* Letter Body */}
                <div className="text-gray-700 space-y-3">
                  <p className="font-medium">Dear {letterData.tutorName},</p>

                  <p>
                    We are pleased to inform you that you have been selected for
                    the position of{" "}
                    <span className="font-semibold">{letterData.position}</span>{" "}
                    at {letterData.companyName}. This letter serves as
                    confirmation of your appointment, effective from{" "}
                    <span className="font-semibold">
                      {formatDate(letterData.joiningDate)}
                    </span>
                    .
                  </p>

                  <div className="space-y-3">
                    {/* Appointment Details */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">
                        APPOINTMENT DETAILS
                      </h3>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 font-medium w-1/3">
                              Position:
                            </td>
                            <td className="py-1">{letterData.position}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">Joining Date:</td>
                            <td className="py-1">
                              {formatDate(letterData.joiningDate)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">Salary:</td>
                            <td className="py-1">{letterData.salary}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">Working Hours:</td>
                            <td className="py-1">{letterData.tuitionTime}</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-medium">Working Days:</td>
                            <td className="py-1">{letterData.workingDays}</td>
                          </tr>
                       
                          <tr>
                            <td className="py-1 font-medium">Notice Period:</td>
                            <td className="py-1">{letterData.noticePeriod}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm">
                        TERMS & CONDITIONS
                      </h3>
                      <ol className="space-y-1 pl-4 text-sm">
                        {letterData.terms.map((term, index) => (
                          <li key={term.id} className="flex">
                            <span className="mr-1">{index + 1}.</span>
                            <span>{term.text}</span>
                          </li>
                        ))}
                     
                        <li className="flex">
                          <span className="mr-1">
                            {letterData.terms.length + 1}.
                          </span>
                          <span>
                            Working days are{" "}
                            <span className="font-semibold">
                              {letterData.workingDays}
                            </span>
                            .
                          </span>
                        </li>
                        <li className="flex">
                          <span className="mr-1">
                            {letterData.terms.length + 2}.
                          </span>
                          <span>
                            The notice period required is{" "}
                            <span className="font-semibold">
                              {letterData.noticePeriod}
                            </span>
                            .
                          </span>
                        </li>
                      </ol>
                    </div>

                    {/* Closing */}
                    <div className="space-y-2 text-sm">
                      <p>
                        We believe that your skills and experience will be a
                        valuable addition to our team.
                      </p>
                      <p>
                        Please sign and return a copy of this letter to confirm
                        your acceptance.
                      </p>
                    </div>

                    {/* Signatures */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="border-t border-gray-300 pt-3">
                          <div className="font-semibold">
                            For {letterData.companyName}
                          </div>
                          <div className="mt-6 border-t border-gray-900 w-32 mx-auto"></div>
                          <div className="mt-2">Authorized Signatory</div>
                          <div className="text-gray-600">HR Department</div>
                        </div>
                      </div>
                      <div>
                        <div className="border-t border-gray-300 pt-3">
                          <div className="font-semibold">Accepted By</div>
                          <div className="mt-6 border-t border-gray-900 w-32 mx-auto"></div>
                          <div className="mt-2">{letterData.tutorName}</div>
                          <div className="text-gray-600">Tutor</div>
                          <div className="mt-2">Date: _______________</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden PDF Content - Optimized for single page */}
        <div
          ref={pdfRef}
          style={{
            position: "absolute",
            left: "-9999px",
            top: "1px",
            width: "794px",
            backgroundColor: "#ffffff",
            color: "#000000",
            padding: "30px",
            boxSizing: "border-box",
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid #000",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                style={{
                  maxHeight: "80px",
                  height: "auto",
                  margin: "0 auto 10px",
                  display: "block",
                }}
              />
            )}
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                margin: "5px 0",
                color: "#000000",
              }}
            >
              APPOINTMENT LETTER
            </h1>
            <p style={{ color: "#555555", margin: "2px 0", fontSize: "14px" }}>
              Official Appointment Confirmation
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "15px",
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  color: "#000000",
                }}
              >
                {letterData.companyName}
              </h2>
              <div style={{ color: "#555555", fontSize: "14px" }}>
                <p style={{ margin: "3px 0" }}>{letterData.companyAddress}</p>
                <p style={{ margin: "3px 0" }}>{letterData.companyPhone}</p>
                <p style={{ margin: "3px 0" }}>{letterData.companyEmail}</p>
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "14px" }}>
              <div style={{ fontWeight: "600", marginBottom: "3px" }}>
                Date:
              </div>
              <div>{formatDate(letterData.date)}</div>
            </div>
          </div>

          <div
            style={{
              background: "#f9fafb",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              fontSize: "14px",
            }}
          >
            <div style={{ fontWeight: "600", marginBottom: "3px" }}>To:</div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                color: "#000000",
                marginTop: "2px",
              }}
            >
              {letterData.tutorName}
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <p
              style={{
                fontWeight: "600",
                marginBottom: "5px",
                fontSize: "14px",
              }}
            >
              Dear {letterData.tutorName},
            </p>
            <p style={{ marginTop: "5px", lineHeight: "1.4" }}>
              We are pleased to inform you that you have been selected for the
              position of
              <strong> {letterData.position}</strong> at{" "}
              {letterData.companyName}. This letter serves as confirmation of
              your appointment, effective from
              <strong> {formatDate(letterData.joiningDate)}</strong>.
            </p>
          </div>

          <div
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              color: "#000000",
              marginBottom: "10px",
            }}
          >
            APPOINTMENT DETAILS
          </div>

          <table
            style={{
              width: "100%",
              marginBottom: "15px",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "4px 6px",
                    border: "1px solid #ddd",
                    fontWeight: "600",
                    width: "35%",
                  }}
                >
                  Position:
                </td>
                <td style={{ padding: "4px 6px", border: "1px solid #ddd" }}>
                  {letterData.position}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "4px 6px",
                    border: "1px solid #ddd",
                    fontWeight: "600",
                  }}
                >
                  Joining Date:
                </td>
                <td style={{ padding: "4px 6px", border: "1px solid #ddd" }}>
                  {formatDate(letterData.joiningDate)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "4px 6px",
                    border: "1px solid #ddd",
                    fontWeight: "600",
                  }}
                >
                  Salary:
                </td>
                <td style={{ padding: "4px 6px", border: "1px solid #ddd" }}>
                  {letterData.salary}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "4px 6px",
                    border: "1px solid #ddd",
                    fontWeight: "600",
                  }}
                >
                  Working Hours:
                </td>
                <td style={{ padding: "4px 6px", border: "1px solid #ddd" }}>
                  {letterData.tuitionTime}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "4px 6px",
                    border: "1px solid #ddd",
                    fontWeight: "600",
                  }}
                >
                  Working Days:
                </td>
                <td style={{ padding: "4px 6px", border: "1px solid #ddd" }}>
                  {letterData.workingDays}
                </td>
              </tr>
            
              <tr>
                <td
                  style={{
                    padding: "4px 6px",
                    border: "1px solid #ddd",
                    fontWeight: "600",
                  }}
                >
                  Notice Period:
                </td>
                <td style={{ padding: "4px 6px", border: "1px solid #ddd" }}>
                  {letterData.noticePeriod}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              color: "#000000",
              marginBottom: "8px",
            }}
          >
            TERMS & CONDITIONS
          </div>

          <ol
            style={{
              marginLeft: "15px",
              marginBottom: "15px",
              color: "#000000",
              lineHeight: "1.3",
              fontSize: "13px",
            }}
          >
            {letterData.terms.map((term, index) => (
              <li key={term.id} style={{ marginBottom: "3px" }}>
                {term.text}
              </li>
            ))}
            <li style={{ marginBottom: "3px" }}>
              Working days are <strong>{letterData.workingDays}</strong>.
            </li>
            <li style={{ marginBottom: "3px" }}>
              The notice period required is{" "}
              <strong>{letterData.noticePeriod}</strong>.
            </li>
          </ol>

          <div
            style={{
              marginBottom: "15px",
              lineHeight: "1.4",
              fontSize: "14px",
            }}
          >
            <p>
              We believe that your skills and experience will be a valuable
              addition to our team.
            </p>
            <p style={{ marginTop: "5px" }}>
              Please sign and return a copy of this letter to confirm your
              acceptance.
            </p>
          </div>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid #000",
              paddingTop: "15px",
              fontSize: "14px",
            }}
          >
            <div style={{ width: "45%", textAlign: "center" }}>
              <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
                For {letterData.companyName}
              </div>
              <div
                style={{
                  marginTop: "30px",
                  borderTop: "1px solid #000",
                  width: "120px",
                  display: "inline-block",
                }}
              ></div>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>
                Authorized Signatory
              </div>
              <div style={{ color: "#666", fontSize: "12px" }}>
                HR Department
              </div>
            </div>
            <div style={{ width: "45%", textAlign: "center" }}>
              <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Accepted By
              </div>
              <div
                style={{
                  marginTop: "30px",
                  borderTop: "1px solid #000",
                  width: "120px",
                  display: "inline-block",
                }}
              ></div>
              <div style={{ marginTop: "5px", fontWeight: "600" }}>
                {letterData.tutorName}
              </div>
              <div style={{ color: "#666", fontSize: "12px" }}>Tutor</div>
              <div style={{ marginTop: "5px" }}>Date: _______________</div>
            </div>
          </div>
        </div>
      </div>

      {/* Send to Student Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl ">
            <div className="p-6">
              <div className="flex items-center justify-center text-purple-600 mb-4">
                <Send className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Send Appointment Letter
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Enter sender ID (Student or Tutor ID)
              </p>

              {sendSuccess ? (
                <div className="text-center p-4 bg-green-50 rounded-lg mb-6">
                  <div className="text-green-600 font-semibold">
                    ✓ Sent Successfully!
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    Appointment letter has been saved successfully.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender ID
                    </label>
                    <input
                      type="text"
                      value={senderId}
                      onChange={(e) => setSenderId(e.target.value)}
                      placeholder="Enter Student Or Tutor ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      This ID will be stored as the sender in the database
                    </p>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        setShowSendModal(false);
                        setSenderId("");
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendToStudent}
                      disabled={sending || !senderId.trim()}
                      className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                          Sending...
                        </>
                      ) : (
                        "Send Letter"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentLetter;
