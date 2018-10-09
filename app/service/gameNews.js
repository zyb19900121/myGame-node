const Service = require("egg").Service;

class GameNewsService extends Service {
  constructor(ctx) {
    super(ctx);
  }

  async index(payload) {
    // 查询所有
    try {
      let result = {};
      let fields =
        "game_news.id, game_news.news_title, game_news.news_thumbnail, game_news.platform, game_news.create_date, game_news.game_id, game.game_name";
      let condition = "1 = 1";
      let limit = payload.pageSize * 1;
      let offset = (payload.currentPage - 1) * payload.pageSize;
      let orderBy = "create_date DESC";

      if (payload.gameId) {
        condition += ` AND game_id = ${payload.gameId}`;
      }

      if (payload.platform) {
        condition += ` AND game_news.platform LIKE '%${payload.platform}%'`;
      }

      if (payload.isBanner === "true") {
        condition += ` AND game_news.is_banner = 1`;
      }

      if (payload.isBanner === "false") {
        condition += ` AND game_news.is_banner = 0`;
      }

      if (payload.startDate && payload.endDate) {
        condition += ` AND game_news.create_date BETWEEN '${
          payload.startDate
        }' AND '${payload.endDate}'`;
      }

      // 查出游戏名称
      // select game_comment.id, game_comment.username, game_comment.user_avatar, game_comment.comment_content, game_comment.create_date, game_comment.game_id, game.game_name
      // from game_comment
      // LEFT JOIN game ON game_comment.game_id = game.id
      // where 1 = 1 ORDER BY create_date DESC LIMIT 15 OFFSET 0

      let sql = `select ${fields} from game_news LEFT JOIN game ON game_news.game_id = game.id where ${condition} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`;

      let countSql = `select count(*) as total from game_news where ${condition}`;
      //查询结果的数组
      // result.list = await this.app.mysql.select("game_comment", {
      //   where: condition,
      //   limit: payload.pageSize * 1, // 返回数据量
      //   offset: (payload.currentPage - 1) * payload.pageSize, // 数据偏移量
      //   orders: [["create_date", "desc"]] //排序
      // });
      //查询结果的总数
      // result.total = await this.app.mysql.count("game_comment", condition);

      //查询结果的数组
      result.list = await this.app.mysql.query(sql);

      //查询结果的总数
      let total = await this.app.mysql.query(countSql);
      result.total = total[0].total;
      return result;
    } catch (err) {
      throw new Error(err);
      this.logger.error(err);
      return err.code;
    }
  }

  async show(id) {
    // 查询单条
    try {
      const result = await this.app.mysql.get("game_news", {
        id: id
      });
      return result;
    } catch (err) {
      throw new Error(err);
      this.logger.error(err);
      return err.code;
    }
  }

  async create(params) {
    // 检查调用是否成功，如果调用失败会抛出异常
    // this.checkSuccess(result);
    // 插入
    try {
      const result = await this.app.mysql.insert("game_news", params); // 在 user 表中，插入 user 的记录
      const insertSuccess = result.affectedRows === 1;
      if (!insertSuccess) throw new Error("添加失败");
      return { msg: "添加成功" };
    } catch (err) {
      throw new Error(err);
      this.logger.error(err);
      return err.code;
    }
  }

  async update(id, gameCompany) {
    // 检查调用是否成功，如果调用失败会抛出异常
    // this.checkSuccess(result);
    // 插入;
    const condition = {
      where: {
        id: id
      }
    };

    try {
      const result = await this.app.mysql.update(
        "game_news",
        gameCompany,
        condition
      );
      const insertSuccess = result.affectedRows === 1;
      if (!insertSuccess) throw new Error("添加失败");
      return {
        msg: "修改成功"
      };
    } catch (err) {
      this.logger.error(err);
      throw new Error(err);
    }
  }

  async destroy(ids) {
    try {
      const result = await Promise.all(
        ids.map(async id => {
          //删除数据
          let singleResult = await this.app.mysql.delete("game_news", {
            id: id
          });
          const insertSuccess = singleResult.affectedRows === 1;

          if (!insertSuccess) throw new Error("删除失败");
        })
      );
      return result;
    } catch (error) {
      throw new Error(error);
      this.logger.error(error);
      return err.code;
    }
  }
}

module.exports = GameNewsService;
