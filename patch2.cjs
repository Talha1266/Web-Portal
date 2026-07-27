const fs = require('fs');
let content = fs.readFileSync('src/pages/UserDashboard.jsx', 'utf8');

const target = `  const handleOpenEditWorker = async (worker) => {
    setEditWorkerObj(worker);
    setEwName(worker.name);
    setEwTrade(worker.trade);
    setEwWage(worker.dailyWage || '');
    setIsEditWorkerModalOpen(true);
  };

  const handleEditWorkerSubmit = async (e) => {
    e.preventDefault();
    await updateWorker(editWorkerObj.id, {
      name: ewName,
      trade: ewTrade,
      dailyWage: Number(ewWage)
    });
    setIsEditWorkerModalOpen(false);
    setEditWorkerObj(null);
    await loadData();
  };`;

const replacement = `  const handleOpenEditWorker = async (worker) => {
    try {
      setEditWorkerObj(worker);
      setEwName(worker.name);
      setEwTrade(worker.trade);
      setEwWage(worker.dailyWage || '');
      setIsEditWorkerModalOpen(true);
    } catch (err) {
      alert("Error opening modal: " + err.message);
    }
  };

  const handleEditWorkerSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateWorker(editWorkerObj.id, {
        name: ewName,
        trade: ewTrade,
        dailyWage: Number(ewWage)
      });
      setIsEditWorkerModalOpen(false);
      setEditWorkerObj(null);
      await loadData();
    } catch (err) {
      alert("Error saving edits: " + err.message);
    }
  };`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/UserDashboard.jsx', content);
console.log("Patched successfully!");
