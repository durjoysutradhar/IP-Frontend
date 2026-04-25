import AdminLayout from '../../components/AdminLayout';

const ManageNotes = () => {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold">Manage Notes</h1>
        <p className="text-gray-600 mt-2">Moderate uploaded study notes</p>
        <div className="card mt-6">
          <p className="text-gray-500">Note moderation interface</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageNotes;
