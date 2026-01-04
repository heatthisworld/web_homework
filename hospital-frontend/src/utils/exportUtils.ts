// 导出CSV文件
const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("没有数据可导出");
    return;
  }

  // 获取所有唯一的键作为表头
  const headers = Object.keys(data[0]);
  
  // 创建CSV内容
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  // 添加BOM标记，使Excel能正确识别UTF-8编码
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const csvWithBOM = new Blob([BOM, csvContent], { type: 'text/csv;charset=utf-8;' });

  // 创建并下载文件
  const link = document.createElement('a');
  const url = URL.createObjectURL(csvWithBOM);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 生成HTML内容用于PDF导出
export const generateHTMLContent = (title: string, data: any[], headers: string[]) => {
  // 添加表格样式
  const tableStyles = `
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        color: #333;
      }
      h1 {
        text-align: center;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      th {
        background-color: #f2f2f2;
        padding: 12px;
        text-align: left;
        border-bottom: 2px solid #ddd;
      }
      td {
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      tr:hover {
        background-color: #f5f5f5;
      }
      .date {
        text-align: right;
        color: #777;
        margin-top: 20px;
      }
      @media print {
        body {
          padding: 0;
        }
      }
    </style>
  `;

  // 生成表格内容
  const tableContent = `
    <table>
      <thead>
        <tr>
          ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // 生成完整HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${tableStyles}
    </head>
    <body>
      <h1>${title}</h1>
      ${tableContent}
      <div class="date">导出时间: ${new Date().toLocaleString('zh-CN')}</div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 100);
        };
      </script>
    </body>
    </html>
  `;
};

// 导出PDF文件（使用浏览器的打印功能）
export const downloadPDF = (data: any[], filename: string, title: string) => {
  if (!data || data.length === 0) {
    alert("没有数据可导出");
    return;
  }

  // 获取所有唯一的键作为表头
  const headers = Object.keys(data[0]);
  
  // 生成HTML内容
  const htmlContent = generateHTMLContent(title, data, headers);
  
  // 创建新窗口并打印
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('无法打开打印窗口，请检查浏览器设置');
    return;
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // 等待内容加载完成后打印
  printWindow.onload = () => {
    printWindow.print();
  };
};

// 导出所有数据
export const exportAllData = (statsData: any, monthlyData: any[], doctorRanking: any[]) => {
  // 准备所有数据
  const allData = [];
  
  // 添加统计概览
  allData.push({
    '数据类别': '统计概览',
    '指标': '近6个月挂号总量',
    '数值': statsData.totalRegistrations || 0,
    '说明': '最近6个月的挂号总量'
  });
  
  allData.push({
    '数据类别': '统计概览',
    '指标': '科室覆盖',
    '数值': statsData.departmentCount || 0,
    '说明': '系统中的科室总数'
  });
  
  allData.push({
    '数据类别': '统计概览',
    '指标': '患者总数',
    '数值': statsData.totalPatients || 0,
    '说明': '系统中的患者总数'
  });
  
  // 添加月度数据
  monthlyData.forEach(month => {
    allData.push({
      '数据类别': '月度趋势',
      '指标': `${month.month}挂号量`,
      '数值': month.registrations,
      '说明': '该月的挂号总量'
    });
  });
  
  // 添加医生排名数据
  doctorRanking.forEach((doctor, index) => {
    allData.push({
      '数据类别': '医生排名',
      '指标': `第${index + 1}名 - ${doctor.name}`,
      '数值': doctor.registrations,
      '说明': `所属科室: ${doctor.department}`
    });
  });
  
  return allData;
};

// 导出月度数据
export const exportMonthlyData = (monthlyData: any[]) => {
  return monthlyData.map(month => ({
    '月份': month.month,
    '挂号量': month.registrations
  }));
};

// 导出医生排名数据
export const exportDoctorRanking = (doctorRanking: any[]) => {
  return doctorRanking.map((doctor, index) => ({
    '排名': index + 1,
    '医生姓名': doctor.name,
    '所属科室': doctor.department,
    '挂号量': doctor.registrations
  }));
};

// 导出CSV文件的封装函数
export const exportToCSV = (data: any[], filename: string) => {
  downloadCSV(data, filename);
};

// 导出报表的主要函数
export const exportReport = (type: 'all' | 'monthly' | 'doctor', statsData: any, monthlyData: any[], doctorRanking: any[]) => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
  
  switch (type) {
    case 'all':
      const allData = exportAllData(statsData, monthlyData, doctorRanking);
      exportToCSV(allData, `医院统计报表_全部数据_${timestamp}`);
      break;
    case 'monthly':
      const monthlyDataExport = exportMonthlyData(monthlyData);
      exportToCSV(monthlyDataExport, `医院统计报表_月度趋势_${timestamp}`);
      break;
    case 'doctor':
      const doctorDataExport = exportDoctorRanking(doctorRanking);
      exportToCSV(doctorDataExport, `医院统计报表_医生排名_${timestamp}`);
      break;
  }
};