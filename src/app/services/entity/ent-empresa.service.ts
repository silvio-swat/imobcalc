import { Empresa, EmpresaArray } from './../../classes/empresa';
import { HelperService } from './../outros/helper.service';
import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})

  /**
   * Métodos para interação com a tabela
   * @author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   */
export class EntEmpresaService {

  // Busca um array da Classe e converte em Obj Json
  empresaObj: EmpresaArray = new EmpresaArray();
  entyObj = this.empresaObj.empresaJson;
  // tslint:disable-next-line: no-inferrable-types
  tableName: string = 'empresa';

  constructor(
    private db: DatabaseService,
    private helper: HelperService
  ) {}

  /**
   * Recebe um objeto e executa insert ou Update
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   * @param empresa json
   */
  async save(empresa: Empresa) {
    const sql = 'SELECT * from ' + this.tableName + ' where id = ?';
    const data: any[] = [empresa.id];
    const result = await this.db.executeSQL(sql, data);
    const rows = result.rows;
    if (rows.length > 0) {
      return this.update(empresa);
    } else {
      return this.insert(empresa);
    }
  }

  /**
   * Faz o insert no BD
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   * @param empresa json
   */
  public insert(empresa: Empresa) {
    let sql = 'insert into '  + this.tableName + ' (';
    let values = '(';
    const data  = [];
    Object.keys(this.entyObj).forEach((key) => {
      data.push(empresa[key]);
      sql += key + ', ';
      values += '?,';
    });
    sql = this.helper.removeUltimosCaracteres(sql, 2);
    values = this.helper.removeUltimosCaracteres(values, 1);
    sql += ') values ' + values + ')';

    return this.db.executeSQL(sql, data);
  }

  /**
   * Update do registro no BD
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   * @param empresa json
   */
  public update(empresa: Empresa) {
    let sqlUp = 'update ' + this.tableName + ' set ';
    let id: number;
    const dataUp = [];
    Object.keys(this.entyObj).forEach((key) => {
        // Grava o ID para ser passado ao array fora do forEach
        if (key === 'id') {
          id = empresa[key];
        } else {
          dataUp.push(empresa[key]);
          sqlUp += key + ' = ?, ';
        }
    });
    dataUp.push(id);
    sqlUp = this.helper.removeUltimosCaracteres(sqlUp, 2);
    sqlUp += ' where id = ?';
    return this.db.executeSQL(sqlUp, dataUp);
  }

  /**
   * Exclui um registro
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   * @param id number
   */
  public delete(id: number) {
    const sql = 'delete from ' + this.tableName + ' where id = ?';
    const data = [id];

    return this.db.executeSQL(sql, data);
  }

  /**
   * Exclui todos as empresas encontradas em um array
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 26-08-2020
   * @version 1.0
   * @param empresas: Empresa[]
   */
  async deletaEmpresas(empresas: Empresa[]) {
    empresas.forEach( async (item: Empresa) => {
      this.delete(item.id);
    });
  }

  /**
   * Carrega um registro conforme ID
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   * @param id number
   */
  async getItem(id: number, sistema: number) {
    const sql = 'SELECT * FROM ' + this.tableName + ' where id = ? and hold = ?';
    const data = [id, sistema];
    const result = await this.db.executeSQL(sql, data);
    const rows = result.rows;
    const empresa = new Empresa();
    if (rows && rows.length > 0) {
      const item = rows.item(0);
      Object.keys(this.entyObj).forEach((key) => {
        empresa[key] = item[key];
      });
    }

    return empresa;
  }

  /**
   * Carrega todos os registros
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   *
   */
  async getAll() {
    const sql = 'SELECT * FROM ' + this.tableName ;
    const  result = await this.db.executeSQL(sql);
    const  empresas = this.fillEmpresas(result.rows);

    return empresas;
  }

  /**
   * Carrega um array com todos os campos necessários
   * author Silvio Watakabe <silvio@tcmed.com.br>
   * @since 23-07-2020
   * @version 1.0
   * @param rows any
   */
  private fillEmpresas(rows: any) {
    const empresas: Empresa[] = [];
    for (let i = 0; i < rows.length; i++) {
      const item = rows.item(i);
      const empresa = new Empresa();
      Object.keys(this.entyObj).forEach((key) => {
        empresa[key] = item[key];
      });
      empresas.push(empresa);
    }

    return empresas;
  }

}
