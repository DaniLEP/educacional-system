import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Package, Calendar, MapPin, FileText, Hash, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../../../firebase";
import { Toaster } from "sonner";

export default function CadastroKalunga() {
  const [form, setForm] = useState({produto: "", sku: "", marca: "", quantidade: "", local: "", obs: "", dataValidade: "", status: ""});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  function handleChange(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); }
  function handleSelectChange(name, value) { setForm((prev) => ({ ...prev, [name]: value })); }
  async function handleSubmit(e) { e.preventDefault();
    const camposVazios = Object.entries(form).some(([_, valor]) => valor.trim() === "");
    if (camposVazios) {toast({title: "Preencha todos os campos!", variant: "destructive",});
      return;
    } setIsLoading(true);
    const db = getDatabase(app);
    const notebookRef = ref(db, "Estoque");

    try {
      await push(notebookRef, form);
      toast({title: "Produto cadastrado com sucesso!", description: "As informações foram salvas no sistema.",});
      setForm({produto: "", sku: "", marca: "", quantidade: "", local: "", obs: "", dataValidade: "", status: "", }); } 
    catch (error) {toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive", }); } 
    finally { setIsLoading(false); }
  }

  const formFields = [
    { label: "SKU", name: "sku", icon: Hash, placeholder: "Ex: KLG-001-2024", description: "Código único do produto" },
    { label: "Produto", name: "produto", icon: Package, placeholder: "Ex: Caneta Esferográfica Azul", description: "Nome completo do produto" },
    { label: "Marca", name: "marca", icon: Building2, placeholder: "Ex: BIC, Pilot, Faber-Castell", description: "Marca do fabricante" },
    { label: "Quantidade", name: "quantidade", icon: Hash, placeholder: "Ex: 50", description: "Quantidade em estoque" },
    { label: "Local", name: "local", icon: MapPin, placeholder: "Ex: Prateleira A-1, Depósito 2", description: "Localização no estoque" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800"> Cadastro Kalunga </CardTitle>
                  <CardDescription className="text-slate-600 mt-1"> Adicione novos produtos ao sistema de estoque </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.map(
                    ({ label, name, icon: Icon, placeholder, description }) => (
                    <div key={name} className="space-y-2">
                      <Label htmlFor={name}
                        className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-500" /> {label}
                      </Label>
                      <Input id={name} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder}
                        className="h-11 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200" />
                      <p className="text-xs text-slate-500">{description}</p>
                    </div>))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dataValidade" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-slate-500" /> Data de Validade
                    </Label>
                    <Input id="dataValidade"  name="dataValidade" type="date" value={form.dataValidade} onChange={handleChange}
                      className="h-11 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200" />
                    <p className="text-xs text-slate-500">Data limite para uso do produto</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" /> Status do Produto </Label>
                    <Select value={form.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novo">Novo</SelectItem>
                        <SelectItem value="Aberto">Aberto</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500"> Condição atual do produto </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="obs" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />Observações</Label>
                  <Textarea id="obs" name="obs" value={form.obs} onChange={handleChange}
                    placeholder="Adicione informações adicionais sobre o produto..."
                    className="min-h-[100px] border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none"/>
                  <p className="text-xs text-slate-500">Informações complementares (opcional)</p>
                </div>
                <div className="flex flex-col-reverse sm:flex-row items-center justify-start sm:justify-between gap-4 pt-6 w-full">
                  {/* Botão Voltar */}
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}
                    className="w-full sm:w-auto h-12 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium px-6 transition-colors duration-200">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Voltar </Button>
                  {/* Botão Cadastrar */}
                  <Button type="submit" disabled={isLoading}
                    className="w-full sm:w-auto h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 px-6">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cadastrando...</div>
                    ) : (<div className="flex items-center gap-2"> <Save className="w-5 h-5" /> Cadastrar Produto</div>)}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}