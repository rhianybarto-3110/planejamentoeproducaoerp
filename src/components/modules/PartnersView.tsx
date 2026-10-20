import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Partner, PartnerType } from '../../types';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  User, 
  X,
  FileText
} from 'lucide-react';
import { formatDocument, formatPhone } from '../../utils/formatters';

interface PartnersViewProps {
  onOpenDeleteConfirm: (id: string, name: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ onOpenDeleteConfirm }) => {
  const { partners, addPartner, updatePartner, searchTerm } = useERP();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<'todos' | PartnerType>('todos');

  // Form states
  const [formName, setFormName] = useState('');
  const [formTradingName, setFormTradingName] = useState('');
  const [formType, setFormType] = useState<PartnerType>('cliente');
  const [formDocument, setFormDocument] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('SP');
  const [formZipCode, setFormZipCode] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setFormName('');
    setFormTradingName('');
    setFormType('cliente');
    setFormDocument('');
    setFormEmail('');
    setFormPhone('');
    setFormStreet('');
    setFormNumber('');
    setFormComplement('');
    setFormNeighborhood('');
    setFormCity('');
    setFormState('SP');
    setFormZipCode('');
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormTradingName(partner.tradingName || '');
    setFormType(partner.type);
    setFormDocument(partner.document);
    setFormEmail(partner.email);
    setFormPhone(partner.phone);
    setFormStreet(partner.address.street);
    setFormNumber(partner.address.number);
    setFormComplement(partner.address.complement || '');
    setFormNeighborhood(partner.address.neighborhood);
    setFormCity(partner.address.city);
    setFormState(partner.address.state);
    setFormZipCode(partner.address.zipCode);
    setFormNotes(partner.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('A Razão Social ou Nome Completo é obrigatório.');
      return;
    }
    if (!formDocument.trim()) {
      setFormError('O documento (CPF ou CNPJ) é obrigatório para emissão de pedidos.');
      return;
    }
    if (!formEmail.trim() && !formPhone.trim()) {
      setFormError('Informe pelo menos um meio de contato (E-mail ou Telefone/WhatsApp).');
      return;
    }

    const partnerData = {
      name: formName.trim(),
      tradingName: formTradingName.trim() || undefined,
      type: formType,
      document: formatDocument(formDocument),
      email: formEmail.trim(),
      phone: formatPhone(formPhone),
      address: {
        street: formStreet.trim() || 'Rua Principal',
        number: formNumber.trim() || 'S/N',
        complement: formComplement.trim() || undefined,
        neighborhood: formNeighborhood.trim() || 'Centro',
        city: formCity.trim() || 'São Paulo',
        state: formState.trim() || 'SP',
        zipCode: formZipCode.trim() || '00000-000',
      },
      notes: formNotes.trim() || undefined,
    };

    if (editingPartner) {
      updatePartner(editingPartner.id, partnerData);
    } else {
      addPartner(partnerData);
    }

    setIsModalOpen(false);
  };

  const filteredPartners = partners.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      (p.tradingName && p.tradingName.toLowerCase().includes(term)) ||
      p.document.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.address.city.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (typeFilter !== 'todos') {
      if (typeFilter === 'cliente') return p.type === 'cliente' || p.type === 'ambos';
      if (typeFilter === 'fornecedor') return p.type === 'fornecedor' || p.type === 'ambos';
      if (typeFilter === 'ambos') return p.type === 'ambos';
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions */}
      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setTypeFilter('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              typeFilter === 'todos'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({partners.length})
          </button>
          <button
            onClick={() => setTypeFilter('cliente')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              typeFilter === 'cliente'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-purple-700 hover:bg-purple-100/50'
            }`}
          >
            Clientes ({partners.filter((p) => p.type === 'cliente' || p.type === 'ambos').length})
          </button>
          <button
            onClick={() => setTypeFilter('fornecedor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              typeFilter === 'fornecedor'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-indigo-700 hover:bg-indigo-100/50'
            }`}
          >
            Fornecedores ({partners.filter((p) => p.type === 'fornecedor' || p.type === 'ambos').length})
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Parceiro</span>
        </button>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Razão Social / Nome</th>
                <th className="py-3 px-4">CNPJ / CPF</th>
                <th className="py-3 px-4">Contato (Email & Tel)</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4">Observações</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Nenhum parceiro comercial encontrado.</p>
                    <p className="text-xs text-slate-400 mt-1">Cadastre clientes ou fornecedores para iniciar seus pedidos.</p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((part) => {
                  return (
                    <tr key={part.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          part.type === 'cliente'
                            ? 'bg-purple-100 text-purple-800'
                            : part.type === 'fornecedor'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {part.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{part.name}</div>
                        {part.tradingName && (
                          <div className="text-[11px] text-slate-400">{part.tradingName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {part.document}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>{part.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>{part.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{part.address.city} - {part.address.state}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {part.address.street}, {part.address.number}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {part.notes || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(part)}
                            title="Editar cadastro"
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteConfirm(part.id, part.name)}
                            title="Excluir parceiro"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastro / Edição de Parceiro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-300" />
                <span>{editingPartner ? 'Editar Cadastro de Parceiro' : 'Novo Cliente ou Fornecedor'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Vínculo *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('cliente')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      formType === 'cliente'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Cliente (Comprador)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('fornecedor')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      formType === 'fornecedor'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Fornecedor (Insumos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('ambos')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      formType === 'ambos'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Ambos (Cliente & Fornecedor)
                  </button>
                </div>
              </div>

              {/* Nome e Nome Fantasia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Razão Social ou Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Madeiras do Vale S.A."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Fantasia (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formTradingName}
                    onChange={(e) => setFormTradingName(e.target.value)}
                    placeholder="Ex: MadVale"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Documento, Email, Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CNPJ ou CPF *
                  </label>
                  <input
                    type="text"
                    value={formDocument}
                    onChange={(e) => setFormDocument(formatDocument(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Comercial
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="comercial@empresa.com.br"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Endereço e Localização
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      placeholder="Av. Industrial"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      placeholder="1250"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formNeighborhood}
                      onChange={(e) => setFormNeighborhood(e.target.value)}
                      placeholder="Distrito Industrial"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="Guarulhos"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      value={formState}
                      maxLength={2}
                      onChange={(e) => setFormState(e.target.value.toUpperCase())}
                      placeholder="SP"
                      className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Comerciais
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Condições de pagamento combinadas, horários de entrega, contatos extras..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
                >
                  {editingPartner ? 'Salvar Alterações' : 'Cadastrar Parceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
